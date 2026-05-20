// (C) 2026 GoodData Corporation

import {
    type IDashboardParameter,
    type IDashboardTab,
    type IParameterMetadataObject,
    isNumberParameterDefinition,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    type IDashboardParameterEntry,
    pickTabParametersSource,
} from "../../../store/tabs/parameters/parametersState.js";
import { DEFAULT_TAB_ID } from "../../../store/tabs/tabsState.js";

/**
 * Builds the parameter slice entries from the dashboard's persisted parameters and the
 * workspace parameter catalog.
 *
 * - When the persisted entry has an explicit `value`, use it as `runtimeOverride`.
 * - Otherwise, look up the workspace default.
 * - When neither is available (catalog gated off / failed / ref missing), `runtimeOverride`
 *   stays `undefined` so the backend keeps using the parameter's own default at execution time.
 */
export function hydrateParameterEntries(
    dashboardParameters: IDashboardParameter[] | undefined,
    workspaceParameters: IParameterMetadataObject[],
): IDashboardParameterEntry[] {
    if (!dashboardParameters || dashboardParameters.length === 0) {
        return [];
    }
    const workspaceByRef = new Map<string, IParameterMetadataObject>(
        workspaceParameters.map((wp) => [objRefToString(wp.ref), wp]),
    );
    return dashboardParameters.map((parameter) => {
        if (parameter.value !== undefined) {
            return { parameter, runtimeOverride: parameter.value };
        }
        const workspaceParameter = workspaceByRef.get(objRefToString(parameter.ref));
        const workspaceDefault =
            workspaceParameter && isNumberParameterDefinition(workspaceParameter.definition)
                ? workspaceParameter.definition.defaultValue
                : undefined;
        return { parameter, runtimeOverride: workspaceDefault };
    });
}

/**
 * Distributes the dashboard's persisted parameters into per-tab hydrated entry lists, applying
 * the V1 → per-tab migration rule (see {@link pickTabParametersSource}). Each tab's parameter
 * list is hydrated against the workspace catalog via {@link hydrateParameterEntries}.
 *
 * For legacy single-tab dashboards (no `tabs[]`), a synthetic tab with `DEFAULT_TAB_ID` is used
 * so the V1 root-level `parameters` migrate transparently.
 *
 * `activeTabOverride` patches `runtimeOverride` on its named tab for refs that match an entry;
 * non-matching refs are silently ignored (see `overrideDefaultParameters` on DashboardConfig).
 */
export function distributeParametersToTabs(
    tabs: IDashboardTab[] | undefined,
    rootParameters: IDashboardParameter[] | undefined,
    workspaceParameters: IParameterMetadataObject[],
    activeTabOverride?: { tabId: string; overrides: IDashboardParameter[] },
): Record<string, IDashboardParameterEntry[]> {
    const effectiveTabs: IDashboardTab[] = tabs ?? [
        { localIdentifier: DEFAULT_TAB_ID, title: "", parameters: rootParameters },
    ];
    const result: Record<string, IDashboardParameterEntry[]> = {};
    for (const tab of effectiveTabs) {
        const source = pickTabParametersSource(tab, effectiveTabs, rootParameters);
        const entries = hydrateParameterEntries(source, workspaceParameters);
        result[tab.localIdentifier] =
            tab.localIdentifier === activeTabOverride?.tabId
                ? applyRuntimeOverrides(entries, activeTabOverride.overrides)
                : entries;
    }
    return result;
}

function applyRuntimeOverrides(
    entries: IDashboardParameterEntry[],
    overrides: IDashboardParameter[],
): IDashboardParameterEntry[] {
    const overrideByRef = new Map<string, number | undefined>(
        overrides.map((o) => [objRefToString(o.ref), o.value]),
    );
    return entries.map((entry) => {
        const key = objRefToString(entry.parameter.ref);
        return overrideByRef.has(key) ? { ...entry, runtimeOverride: overrideByRef.get(key) } : entry;
    });
}
