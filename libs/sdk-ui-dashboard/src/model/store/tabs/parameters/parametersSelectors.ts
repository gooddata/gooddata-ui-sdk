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
    insightParameters,
    isDashboardLayout,
    isInsightWidget,
    isNumberParameterDefinition,
    isVisualizationSwitcherWidget,
    objRefToString,
} from "@gooddata/sdk-model";

import { type ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
import { createMemoizedSelector } from "../../_infra/selectors.js";
import { selectCatalogParameters, selectCatalogParametersIsLoaded } from "../../catalog/catalogSelectors.js";
import { selectEnableParameters } from "../../config/configSelectors.js";
import { selectInsightsMap } from "../../insights/insightsSelectors.js";
import { type DashboardSelector } from "../../types.js";
import { selectActiveTab, selectTabs } from "../tabsSelectors.js";
import { DEFAULT_TAB_ID, type ITabState } from "../tabsState.js";

import {
    type IDashboardParameterEntry,
    parametersInitialState,
    pickTabParametersSource,
} from "./parametersState.js";

const EMPTY_PARAMETERS: IDashboardParameter[] = [];
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
 * The widget's owning tab is resolved from layout, then the result is the intersection of that
 * tab's parameter entries and the parameters referenced by the widget's insight (per
 * `insightParameters`). Dashboard parameters not referenced by the widget's insight are excluded
 * so that adding/removing unrelated parameters does not invalidate the widget's `defFingerprint`.
 * Returns an empty array when `enableParameters` is off so persisted parameter values cannot
 * silently affect execution while the UI is hidden.
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
        (context, insights, isEnabled) => {
            if (!isEnabled || !context) {
                return [];
            }
            const insight = insights.get(context.widget.insight);
            if (!insight) {
                return [];
            }
            const entries = context.tab.parameters?.parameters ?? parametersInitialState.parameters;
            const referencedRefs = new Set(
                insightParameters(insight).map((parameter) => objRefToString(parameter.ref)),
            );
            const result: IInsightParameterValue[] = [];
            for (const entry of entries) {
                if (entry.runtimeOverride === undefined) {
                    continue;
                }
                if (referencedRefs.has(objRefToString(entry.parameter.ref))) {
                    result.push({ ref: entry.parameter.ref, value: entry.runtimeOverride });
                }
            }
            return result;
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
