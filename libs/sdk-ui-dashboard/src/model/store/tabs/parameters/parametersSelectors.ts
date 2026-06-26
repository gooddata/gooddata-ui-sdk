// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { isEqual } from "lodash-es";

import {
    type IDashboardExportParameter,
    type IDashboardParameter,
    type IDashboardTab,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    type IdentifierRef,
    type ObjRef,
    areObjRefsEqual,
    insightParameters,
    objRefToString,
} from "@gooddata/sdk-model";

import { createMemoizedSelector } from "../../_infra/selectors.js";
import {
    selectCatalogMeasureParameters,
    selectCatalogMeasureParametersStatus,
    selectCatalogParameterByRef,
    selectCatalogParameters,
    selectCatalogParametersIsLoaded,
} from "../../catalog/catalogSelectors.js";
import { selectEnableParameters } from "../../config/configSelectors.js";
import { selectInsightsMap } from "../../insights/insightsSelectors.js";
import { selectIsInEditMode } from "../../renderMode/renderModeSelectors.js";
import { type DashboardSelector } from "../../types.js";
import { selectAllTabsInsightWidgetContexts } from "../layout/layoutSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier, selectActiveTab, selectTabs } from "../tabsSelectors.js";
import { DEFAULT_TAB_ID } from "../tabsState.js";

import {
    EMPTY_EXPORT_PARAMETERS_BY_TAB,
    type IParameterReconciliationEntry,
    type ParameterReconciliation,
    applyRuntimeOverride,
    buildPersistedByTabAndRef,
    buildWidgetScopeTabRefSelections,
    buildWorkspaceParametersByRef,
    classifyParameterReconciliation,
    collectExportOverrides,
    collectParameterReconciliations,
    collectReferencedParameterRefs,
    computeParameterResetTargets,
    computeParameterResetValue,
    resolveEffectiveParameterValuesForRefs,
    smartPersistResolvedEntry,
} from "./parametersHelpers.js";
import {
    type IDashboardParameterEntry,
    parametersInitialState,
    pickTabParametersSource,
} from "./parametersState.js";

const EMPTY_PARAMETERS: IDashboardParameter[] = [];
const EMPTY_EXPORT_PARAMETERS: IDashboardExportParameter[] = [];
const EMPTY_PARAMETER_VALUES: IInsightParameterValue[] = [];
const EMPTY_TABS: IDashboardTab[] = [];
const EMPTY_RESET_TARGETS: { ref: ObjRef; value: number | undefined }[] = [];
const EMPTY_RECONCILIATIONS: IParameterReconciliationEntry[] = [];

const selectParametersState = createSelector(
    selectActiveTab,
    (activeTab) => activeTab?.parameters ?? parametersInitialState,
);

const selectPersistedParametersFromMeta: DashboardSelector<IDashboardParameter[]> = (state) =>
    state.meta?.persistedDashboard?.parameters ?? EMPTY_PARAMETERS;

const selectPersistedDashboardTabsRaw: DashboardSelector<IDashboardTab[]> = (state) =>
    state.meta?.persistedDashboard?.tabs ?? EMPTY_TABS;

// Built once and shared by reference, so the per-widget execution selectors don't each
// reconstruct an identical catalog-by-ref map.
const selectWorkspaceParametersByRef: DashboardSelector<Map<string, IParameterMetadataObject>> =
    createSelector(selectCatalogParameters, buildWorkspaceParametersByRef);

/**
 * Returns the persisted-shape parameter entries currently held by the active tab.
 *
 * @alpha
 */
export const selectDashboardParameters: DashboardSelector<IDashboardParameter[]> = createSelector(
    selectParametersState,
    (state) => state.parameters.map((entry) => entry.parameter),
);

/**
 * Returns currently active parameter references on the active tab.
 *
 * @alpha
 */
export const selectActiveParameterRefKeys: DashboardSelector<ReadonlySet<string>> = createSelector(
    selectDashboardParameters,
    (parameters) => new Set(parameters.map((parameter) => objRefToString(parameter.ref))),
);

/**
 * Returns the full per-parameter entries (persisted shape + ephemeral `runtimeOverride`) for the
 * active tab.
 *
 * @internal
 */
export const selectDashboardParameterEntries: DashboardSelector<IDashboardParameterEntry[]> = createSelector(
    selectParametersState,
    (state) => state.parameters,
);

/**
 * Returns the active tab's parameters in the shape persisted by a filter view.
 * Runtime overrides become persisted `value`; existing parameter values are kept when no runtime value exists.
 *
 * @internal
 */
export const selectFilterViewParameters: DashboardSelector<IDashboardParameter[] | undefined> =
    createSelector(selectDashboardParameterEntries, (entries) => {
        if (entries.length === 0) {
            return undefined;
        }
        return entries.map(applyRuntimeOverride);
    });

/**
 * Returns a selector that yields the entry held by the active tab for a given parameter ref,
 * or `undefined` if no such entry exists.
 *
 * @alpha
 */
export const selectDashboardParameterEntryByRef: (
    ref: ObjRef,
) => DashboardSelector<IDashboardParameterEntry | undefined> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectParametersState, (state) =>
        state.parameters.find((item) => areObjRefsEqual(item.parameter.ref, ref)),
    ),
);

/**
 * Returns a selector that yields the current `runtimeOverride` for a given parameter ref on the
 * active tab, or `undefined` if the active tab does not hold an entry for that ref.
 *
 * @alpha
 */
export const selectParameterRuntimeOverrideByRef: (ref: ObjRef) => DashboardSelector<number | undefined> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(selectDashboardParameterEntryByRef(ref), (entry) => entry?.runtimeOverride),
    );

/**
 * Reset value for a parameter chip's dropdown, bound to the kit dropdown's `resetValue` prop.
 *
 * Returns `undefined` (Reset hidden) in edit mode when `parameter.value` is unset or already
 * equals the workspace default — both would be unpin no-ops on next save.
 *
 * @alpha
 */
export const selectParameterResetValueByRef: (ref: ObjRef) => DashboardSelector<number | undefined> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(
            selectDashboardParameterEntryByRef(ref),
            selectCatalogParameterByRef(ref),
            selectIsInEditMode,
            (entry, workspaceParameter, isInEditMode) => {
                if (!entry) {
                    return undefined;
                }
                return computeParameterResetValue(entry, workspaceParameter, isInEditMode);
            },
        ),
    );

/**
 * Computes the dashboard parameters keyed by tab `localIdentifier` in the shape that would be
 * persisted on save right now.
 *
 * @remarks
 * Smart persistence applies independently per tab: `value` is dropped when equal to the
 * workspace default, `label` is dropped when equal to the parameter title, all per tab.
 * Non-resolved entries (catalog not loaded, gated off, ref missing) are emitted verbatim from
 * the previously persisted entry on the same tab when available. V1 fallback applies when no
 * tab in the persisted dashboard carries `parameters` — the persisted root array is used as the
 * persistence source for every tab.
 *
 * @internal
 */
export const selectSmartPersistedTabsParameters: DashboardSelector<Record<string, IDashboardParameter[]>> =
    createSelector(
        selectTabs,
        selectWorkspaceParametersByRef,
        selectCatalogParametersIsLoaded,
        selectPersistedDashboardTabsRaw,
        selectPersistedParametersFromMeta,
        (tabs, workspaceParameterByRef, isCatalogLoaded, persistedTabs, rootPersistedParameters) => {
            const result: Record<string, IDashboardParameter[]> = {};
            if (!tabs) {
                return result;
            }
            const persistedByTabAndRef = buildPersistedByTabAndRef(persistedTabs, rootPersistedParameters);
            for (const tab of tabs) {
                const entries = tab.parameters?.parameters ?? [];
                const persistedForTab = persistedByTabAndRef.get(tab.localIdentifier) ?? new Map();
                result[tab.localIdentifier] = entries.map((entry) => {
                    const refKey = objRefToString(entry.parameter.ref);
                    const workspaceParameter = isCatalogLoaded
                        ? workspaceParameterByRef.get(refKey)
                        : undefined;
                    if (!workspaceParameter) {
                        return persistedForTab.get(refKey) ?? entry.parameter;
                    }
                    return smartPersistResolvedEntry(entry, workspaceParameter);
                });
            }
            return result;
        },
    );

/**
 * Returns persisted parameters from `meta.persistedDashboard`, keyed by tab `localIdentifier`.
 * Honors V1 → per-tab migration: when no tab in the persisted dashboard carries `parameters`,
 * the persisted root `parameters` is used as fallback for every tab. For legacy single-tab
 * dashboards (no `tabs[]` in persistedDashboard), the synthetic `DEFAULT_TAB_ID` tab carries
 * the persisted root parameters.
 *
 * @internal
 */
const selectPersistedTabsParametersFromMeta: DashboardSelector<Record<string, IDashboardParameter[]>> =
    createSelector(
        selectPersistedDashboardTabsRaw,
        selectPersistedParametersFromMeta,
        (persistedTabs, rootPersistedParameters) => {
            const result: Record<string, IDashboardParameter[]> = {};
            if (persistedTabs.length === 0) {
                result[DEFAULT_TAB_ID] = rootPersistedParameters;
                return result;
            }
            for (const tab of persistedTabs) {
                result[tab.localIdentifier] =
                    pickTabParametersSource(tab, persistedTabs, rootPersistedParameters) ?? EMPTY_PARAMETERS;
            }
            return result;
        },
    );

/**
 * Returns true if the dashboard parameters that would be persisted differ from the persisted
 * version on any tab.
 *
 * @alpha
 */
export const selectIsParametersChanged: DashboardSelector<boolean> = createSelector(
    selectSmartPersistedTabsParameters,
    selectPersistedTabsParametersFromMeta,
    (smartPersistedByTab, persistedByTab) => {
        const allTabIds = new Set([...Object.keys(smartPersistedByTab), ...Object.keys(persistedByTab)]);
        for (const tabId of allTabIds) {
            const smart = smartPersistedByTab[tabId] ?? EMPTY_PARAMETERS;
            const persisted = persistedByTab[tabId] ?? EMPTY_PARAMETERS;
            if (!isEqual(smart, persisted)) {
                return true;
            }
        }
        return false;
    },
);

/**
 * Reset targets for every active-tab parameter whose `runtimeOverride` differs from its computed
 * reset value (per `computeParameterResetValue`).
 *
 * @internal
 */
export const selectActiveTabParameterResetTargets: DashboardSelector<
    { ref: ObjRef; value: number | undefined }[]
> = createSelector(
    selectDashboardParameterEntries,
    selectCatalogParameters,
    selectIsInEditMode,
    selectEnableParameters,
    (entries, workspaceParameters, isInEditMode, isEnabled) => {
        if (!isEnabled) {
            return EMPTY_RESET_TARGETS;
        }
        const targets = computeParameterResetTargets(entries, workspaceParameters, isInEditMode);
        return targets.length === 0 ? EMPTY_RESET_TARGETS : targets;
    },
);

/**
 * True when the active tab has at least one parameter whose `runtimeOverride` differs from
 * the value it would be reset to (per `computeParameterResetValue`).
 *
 * @alpha
 */
export const selectHasAnyResettableParameterOnActiveTab: DashboardSelector<boolean> = createSelector(
    selectActiveTabParameterResetTargets,
    (targets) => targets.length > 0,
);

/**
 * Dashboard-wide list of parameters that no longer reconcile against the workspace parameters
 * (per {@link classifyParameterReconciliation}), deduped by ref across tabs.
 *
 * @internal
 */
export const selectParameterReconciliations: DashboardSelector<IParameterReconciliationEntry[]> =
    createSelector(
        selectTabs,
        selectCatalogParameters,
        selectCatalogParametersIsLoaded,
        selectEnableParameters,
        (tabs, workspaceParameters, isCatalogLoaded, isEnabled) => {
            if (!isEnabled || !isCatalogLoaded || !tabs) {
                return EMPTY_RECONCILIATIONS;
            }
            const entries = tabs.flatMap((tab) => tab.parameters?.parameters ?? []);
            const result = collectParameterReconciliations(entries, workspaceParameters);
            return result.length === 0 ? EMPTY_RECONCILIATIONS : result;
        },
    );

/**
 * Per-ref reconciliation status for the active tab's parameter chip (per {@link classifyParameterReconciliation}).
 *
 * @internal
 */
export const selectParameterReconciliationByRef: (
    ref: ObjRef,
) => DashboardSelector<ParameterReconciliation | undefined> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectDashboardParameterEntryByRef(ref),
        selectCatalogParameterByRef(ref),
        selectCatalogParametersIsLoaded,
        selectEnableParameters,
        (entry, workspaceParameter, isCatalogLoaded, isEnabled) => {
            if (!isEnabled || !isCatalogLoaded || !entry) {
                return undefined;
            }
            return classifyParameterReconciliation(entry.parameter, workspaceParameter);
        },
    ),
);

interface IWidgetParameterContext {
    entries: IDashboardParameterEntry[];
    measureParameters: Record<string, IdentifierRef[]>;
    // Workspace catalog keyed by ref, so out-of-range runtime values recover to the default at execution.
    workspaceParameterByRef: Map<string, IParameterMetadataObject>;
    // The executed insight can differ from the widget's own (e.g. a drill overlay).
    widgetInsightRef: ObjRef;
}

/**
 * Owning-tab parameter entries and the metric → parameter map for a widget, keyed by ref.
 *
 * @internal
 */
export const selectWidgetParameterContext: (
    ref: ObjRef | undefined,
) => DashboardSelector<IWidgetParameterContext | undefined> = createMemoizedSelector(
    (ref: ObjRef | undefined) =>
        createSelector(
            selectAllTabsInsightWidgetContexts,
            selectEnableParameters,
            selectCatalogMeasureParameters,
            selectCatalogMeasureParametersStatus,
            selectWorkspaceParametersByRef,
            (contexts, isEnabled, measureParameters, measureParametersStatus, workspaceParameterByRef) => {
                if (!isEnabled || !ref || measureParametersStatus !== "loaded") {
                    return undefined;
                }
                const context = contexts.find((ctx) => areObjRefsEqual(ctx.widget.ref, ref));
                if (!context) {
                    return undefined;
                }
                const entries = context.tab.parameters?.parameters ?? parametersInitialState.parameters;
                return {
                    entries,
                    measureParameters,
                    workspaceParameterByRef,
                    widgetInsightRef: context.widget.insight,
                };
            },
        ),
);

// Adds the widget's *own* insight and referenced refs for the ref-based selectors below (alerting and
// CSV export, which always concern the widget itself — never a drill target).
const selectWidgetInsightAndReferencedRefs = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(selectWidgetParameterContext(ref), selectInsightsMap, (resolved, insights) => {
        if (!resolved) {
            return undefined;
        }
        const { entries, measureParameters, workspaceParameterByRef, widgetInsightRef } = resolved;
        const insight = insights.get(widgetInsightRef);
        if (!insight) {
            return undefined;
        }
        const referencedRefs = collectReferencedParameterRefs(insight, measureParameters);
        return { insight, referencedRefs, entries, workspaceParameterByRef };
    }),
);

/**
 * Returns the parameter values to inject into the widget's `IExecutionConfig.parameterValues`.
 *
 * @remarks
 * For each parameter referenced by the widget's metrics (via the dashboard-wide MAQL
 * metric → parameter dependency map), the value is resolved in this order:
 *
 * 1. dashboard chip on the widget's tab with `runtimeOverride !== undefined`,
 * 2. else `insight.parameters` entry for that ref (AD-authored per-insight override),
 * 3. else nothing (backend uses workspace default).
 *
 * Parameters not referenced by the widget's metrics are excluded so that adding/removing
 * unrelated parameters does not invalidate the widget's `defFingerprint`. Returns `[]` when
 * `enableParameters` is off or while the dependency map has not been loaded.
 *
 * @alpha
 */
export const selectEffectiveParameterValuesForWidget: (
    ref: ObjRef | undefined,
) => DashboardSelector<IInsightParameterValue[]> = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(selectWidgetInsightAndReferencedRefs(ref), (resolved) => {
        if (!resolved) {
            return EMPTY_PARAMETER_VALUES;
        }
        const { insight, referencedRefs, entries, workspaceParameterByRef } = resolved;
        return resolveEffectiveParameterValuesForRefs(
            entries,
            referencedRefs,
            insightParameters(insight),
            workspaceParameterByRef,
        );
    }),
);

/**
 * The insight half of {@link selectEffectiveParameterValuesForWidget}: insight-authored values for
 * the metric-referenced refs, flag-gated and ref-filtered, with no dashboard chip overrides.
 *
 * @remarks
 * Raw CSV export inlines a resolved AFM, so it must carry parameters explicitly rather than letting
 * the backend re-resolve them. This is the base; the dialog's `content.parametersByTab` overrides go
 * on top.
 *
 * @internal
 */
export const selectReferencedInsightParameterValuesForWidget: (
    ref: ObjRef | undefined,
) => DashboardSelector<IInsightParameterValue[]> = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(selectWidgetInsightAndReferencedRefs(ref), (resolved) => {
        if (!resolved) {
            return EMPTY_PARAMETER_VALUES;
        }
        const { insight, referencedRefs, workspaceParameterByRef } = resolved;
        return resolveEffectiveParameterValuesForRefs(
            [],
            referencedRefs,
            insightParameters(insight),
            workspaceParameterByRef,
        );
    }),
);

/**
 * Returns the effective dashboard parameters (persisted shape with any `runtimeOverride` folded
 * into `value`) held by the widget's owning tab.
 *
 * @internal
 */
export const selectEffectiveDashboardParametersForWidget: (
    ref: ObjRef | undefined,
) => DashboardSelector<IDashboardParameter[]> = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(
        selectAllTabsInsightWidgetContexts,
        selectDashboardParameterEntries,
        (contexts, activeTabEntries) => {
            if (ref === undefined) {
                return activeTabEntries.map(applyRuntimeOverride);
            }
            // A concrete ref that resolves to no tab means the widget is not on the dashboard;
            // falling back to the active tab would apply an unrelated tab's modes/labels/values.
            const owningTabEntries = contexts.find((context) => areObjRefsEqual(context.widget.ref, ref))?.tab
                .parameters?.parameters;
            return (owningTabEntries ?? parametersInitialState.parameters).map(applyRuntimeOverride);
        },
    ),
);

/**
 * Returns the per-tab parameter overrides to send on dashboard tabular export, keyed by
 * tab `localIdentifier`. The shape matches the backend's `dashboardTabsParametersOverrides`
 * field directly.
 *
 * @remarks
 * Scope rules:
 * - When `widgetIds` is empty/undefined (whole-dashboard export), every tab in scope contributes
 *   parameter entries with a `runtimeOverride`.
 * - When `widgetIds` is non-empty, each widget's owning tab contributes only entries with a
 *   `runtimeOverride` whose ref is referenced by the widget's insight metrics via the dashboard-wide
 *   metric → parameter dependency map. Multi-widget across distinct owning tabs yields one
 *   map entry per owning tab; entries for the same tab are unioned and deduplicated by ref.
 *
 * Returns `{}` (signalling "omit the field on the wire") when:
 * - `enableParameters` is off,
 * - the workspace catalog parameters are not loaded,
 * - (widget scope only) the `measureParameters` dependency map is not loaded,
 * - or no in-scope parameter has a `runtimeOverride`.
 *
 * @alpha
 */
export const selectExportEffectiveParameters: (
    widgetIds: string[] | undefined,
) => DashboardSelector<Record<string, IDashboardExportParameter[]>> = (widgetIds) =>
    widgetIds?.length
        ? selectExportEffectiveParametersForWidgets(widgetIds)
        : selectExportEffectiveParametersDashboardScope;

const selectExportEffectiveParametersDashboardScope: DashboardSelector<
    Record<string, IDashboardExportParameter[]>
> = createSelector(
    selectTabs,
    selectEnableParameters,
    selectWorkspaceParametersByRef,
    selectCatalogParametersIsLoaded,
    (tabs, isEnabled, workspaceParameterByRef, isCatalogLoaded) => {
        if (!isEnabled || !isCatalogLoaded || !tabs?.length) {
            return EMPTY_EXPORT_PARAMETERS_BY_TAB;
        }
        return collectExportOverrides(
            tabs.map((tab) => ({ tab })),
            workspaceParameterByRef,
        );
    },
);

const selectExportEffectiveParametersForWidgets: (
    widgetIds: ReadonlyArray<string>,
) => DashboardSelector<Record<string, IDashboardExportParameter[]>> = createMemoizedSelector(
    (widgetIds: ReadonlyArray<string>) =>
        createSelector(
            selectAllTabsInsightWidgetContexts,
            selectInsightsMap,
            selectEnableParameters,
            selectWorkspaceParametersByRef,
            selectCatalogParametersIsLoaded,
            selectCatalogMeasureParameters,
            selectCatalogMeasureParametersStatus,
            (
                widgetContexts,
                insights,
                isEnabled,
                workspaceParameterByRef,
                isCatalogLoaded,
                measureParameters,
                measureParametersStatus,
            ) => {
                if (!isEnabled || !isCatalogLoaded || measureParametersStatus !== "loaded") {
                    return EMPTY_EXPORT_PARAMETERS_BY_TAB;
                }
                const tabRefSelections = buildWidgetScopeTabRefSelections(
                    widgetContexts,
                    widgetIds,
                    insights,
                    measureParameters,
                );
                return collectExportOverrides(tabRefSelections, workspaceParameterByRef);
            },
        ),
);

/**
 * Active-tab slice of {@link selectExportEffectiveParameters}.
 *
 * @internal
 */
export const selectActiveTabExportParameters: DashboardSelector<IDashboardExportParameter[]> = createSelector(
    selectExportEffectiveParametersDashboardScope,
    selectActiveOrDefaultTabLocalIdentifier,
    (parametersByTab, activeTabId) => parametersByTab[activeTabId] ?? EMPTY_EXPORT_PARAMETERS,
);
