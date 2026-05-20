// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { isEqual } from "lodash-es";

import {
    type IDashboardLayout,
    type IDashboardParameter,
    type IDashboardTab,
    type IInsightParameterValue,
    type IInsightWidget,
    type IParameterMetadataObject,
    type ObjRef,
    areObjRefsEqual,
    insightMeasures,
    insightParameters,
    isDashboardLayout,
    isInsightWidget,
    isMeasureDefinition,
    isNumberParameterDefinition,
    isVisualizationSwitcherWidget,
    objRefToString,
} from "@gooddata/sdk-model";

import { type ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
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
import { selectActiveTab, selectTabs } from "../tabsSelectors.js";
import { DEFAULT_TAB_ID, type ITabState } from "../tabsState.js";

import {
    type IDashboardParameterEntry,
    parametersInitialState,
    pickTabParametersSource,
} from "./parametersState.js";

const EMPTY_PARAMETERS: IDashboardParameter[] = [];
const EMPTY_PARAMETER_VALUES: IInsightParameterValue[] = [];
const EMPTY_TABS: IDashboardTab[] = [];

const selectParametersState = createSelector(
    selectActiveTab,
    (activeTab) => activeTab?.parameters ?? parametersInitialState,
);

const selectPersistedParametersFromMeta: DashboardSelector<IDashboardParameter[]> = (state) =>
    state.meta?.persistedDashboard?.parameters ?? EMPTY_PARAMETERS;

const selectPersistedDashboardTabsRaw: DashboardSelector<IDashboardTab[]> = (state) =>
    state.meta?.persistedDashboard?.tabs ?? EMPTY_TABS;

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
        return entries.map((entry) => {
            if (entry.runtimeOverride === undefined) {
                return entry.parameter;
            }
            return { ...entry.parameter, value: entry.runtimeOverride };
        });
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
                if (!workspaceParameter || !isNumberParameterDefinition(workspaceParameter.definition)) {
                    return undefined;
                }
                const workspaceDefault = workspaceParameter.definition.defaultValue;
                const dashboardOverride = entry.parameter.value;
                if (isInEditMode) {
                    if (dashboardOverride === undefined || dashboardOverride === workspaceDefault) {
                        return undefined;
                    }
                    return workspaceDefault;
                }
                return dashboardOverride ?? workspaceDefault;
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
        selectCatalogParameters,
        selectCatalogParametersIsLoaded,
        selectPersistedDashboardTabsRaw,
        selectPersistedParametersFromMeta,
        (tabs, workspaceParameters, isCatalogLoaded, persistedTabs, rootPersistedParameters) => {
            const result: Record<string, IDashboardParameter[]> = {};
            if (!tabs) {
                return result;
            }
            const workspaceByRef = new Map(workspaceParameters.map((wp) => [objRefToString(wp.ref), wp]));
            const persistedByTabAndRef = buildPersistedByTabAndRef(persistedTabs, rootPersistedParameters);
            for (const tab of tabs) {
                const entries = tab.parameters?.parameters ?? [];
                const persistedForTab = persistedByTabAndRef.get(tab.localIdentifier) ?? new Map();
                result[tab.localIdentifier] = entries.map((entry) => {
                    const refKey = objRefToString(entry.parameter.ref);
                    const workspaceParameter = isCatalogLoaded ? workspaceByRef.get(refKey) : undefined;
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
    createSelector(
        selectParameterExecutionContextByWidgetRef(ref),
        selectInsightsMap,
        selectEnableParameters,
        selectCatalogMeasureParameters,
        selectCatalogMeasureParametersStatus,
        (context, insights, isEnabled, measureParameters, measureParametersStatus) => {
            if (!isEnabled || !context || measureParametersStatus !== "loaded") {
                return EMPTY_PARAMETER_VALUES;
            }
            const insight = insights.get(context.widget.insight);
            if (!insight) {
                return EMPTY_PARAMETER_VALUES;
            }
            const referencedRefs = new Set<string>();
            for (const measure of insightMeasures(insight)) {
                const def = measure.measure.definition;
                if (!isMeasureDefinition(def)) {
                    continue;
                }
                const parameterRefs = measureParameters[objRefToString(def.measureDefinition.item)] ?? [];
                for (const parameterRef of parameterRefs) {
                    referencedRefs.add(objRefToString(parameterRef));
                }
            }
            const entries = context.tab.parameters?.parameters ?? parametersInitialState.parameters;
            const result: IInsightParameterValue[] = [];
            const seen = new Set<string>();
            for (const entry of entries) {
                if (entry.runtimeOverride === undefined) {
                    continue;
                }
                const refKey = objRefToString(entry.parameter.ref);
                if (!referencedRefs.has(refKey)) {
                    continue;
                }
                result.push({ ref: entry.parameter.ref, value: entry.runtimeOverride });
                seen.add(refKey);
            }
            for (const insightParameter of insightParameters(insight)) {
                const refKey = objRefToString(insightParameter.ref);
                if (!referencedRefs.has(refKey) || seen.has(refKey)) {
                    continue;
                }
                result.push(insightParameter);
                seen.add(refKey);
            }
            return result.length === 0 ? EMPTY_PARAMETER_VALUES : result;
        },
    ),
);

interface IParameterExecutionContext {
    tab: ITabState;
    widget: IInsightWidget;
}

const selectParameterExecutionContextByWidgetRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<IParameterExecutionContext | undefined> = createMemoizedSelector(
    (ref: ObjRef | undefined) =>
        createSelector(selectTabs, (tabs) => findParameterExecutionContext(tabs, ref)),
);

function findParameterExecutionContext(
    tabs: ITabState[] | undefined,
    ref: ObjRef | undefined,
): IParameterExecutionContext | undefined {
    if (!ref || !tabs) {
        return undefined;
    }

    for (const tab of tabs) {
        const layout = tab.layout?.layout;
        if (!layout) {
            continue;
        }

        const widget = findInsightWidgetInLayout(layout, ref);
        if (widget) {
            return { tab, widget };
        }
    }

    return undefined;
}

function findInsightWidgetInLayout(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    ref: ObjRef,
): IInsightWidget | undefined {
    for (const section of layout.sections) {
        for (const item of section.items) {
            const widget = item.widget;
            if (!widget) {
                continue;
            }

            if (isInsightWidget(widget) && areObjRefsEqual(widget.ref, ref)) {
                return widget;
            }

            if (isDashboardLayout(widget)) {
                const nestedWidget = findInsightWidgetInLayout(widget, ref);
                if (nestedWidget) {
                    return nestedWidget;
                }
            }

            if (isVisualizationSwitcherWidget(widget)) {
                const visualization = widget.visualizations.find((visualization) =>
                    areObjRefsEqual(visualization.ref, ref),
                );
                if (visualization) {
                    return visualization;
                }
            }
        }
    }

    return undefined;
}

function buildPersistedByTabAndRef(
    persistedTabs: ReadonlyArray<IDashboardTab>,
    rootPersistedParameters: IDashboardParameter[],
): Map<string, Map<string, IDashboardParameter>> {
    const result = new Map<string, Map<string, IDashboardParameter>>();
    for (const tab of persistedTabs) {
        const sourceParameters =
            pickTabParametersSource(tab, persistedTabs, rootPersistedParameters) ?? EMPTY_PARAMETERS;
        result.set(
            tab.localIdentifier,
            new Map(sourceParameters.map((parameter) => [objRefToString(parameter.ref), parameter])),
        );
    }
    return result;
}

function smartPersistResolvedEntry(
    entry: IDashboardParameterEntry,
    workspaceParameter: IParameterMetadataObject,
): IDashboardParameter {
    const workspaceDefault = isNumberParameterDefinition(workspaceParameter.definition)
        ? workspaceParameter.definition.defaultValue
        : undefined;
    const result: IDashboardParameter = {
        ref: entry.parameter.ref,
        parameterType: entry.parameter.parameterType,
        mode: entry.parameter.mode,
        ...labelOverride(entry, workspaceParameter),
    };
    if (entry.runtimeOverride === undefined || entry.runtimeOverride === workspaceDefault) {
        return result;
    }
    return { ...result, value: entry.runtimeOverride };
}

function labelOverride(
    entry: IDashboardParameterEntry,
    workspaceParameter: IParameterMetadataObject,
): { label?: string } {
    if (entry.parameter.label && entry.parameter.label !== workspaceParameter.title) {
        return { label: entry.parameter.label };
    }
    return {};
}
