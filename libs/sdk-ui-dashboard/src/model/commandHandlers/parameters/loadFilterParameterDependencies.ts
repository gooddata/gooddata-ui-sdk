// (C) 2026 GoodData Corporation

import { type FilterContextItem, type IDashboard } from "@gooddata/sdk-model";

import { type ICatalogFilterParametersState } from "../../store/catalog/catalogState.js";
import { collectFilterParameterRoots } from "../../store/tabs/parameters/parametersHelpers.js";
import { type DashboardContext } from "../../types/commonTypes.js";

import { loadReachableParameterMap } from "./loadInsightParameterDependencies.js";

/**
 * Loads the dashboard-wide dashboard-filter → parameter dependency map from the workspace references
 * service.
 *
 * @remarks
 * A dashboard filter is not part of any insight, so the insight-rooted map cannot see the parameters a
 * widget depends on through it. The roots are the objects the filters read (see
 * {@link collectFilterParameterRoots}); they go to the service in the same single `direction: "down"`
 * request shape as the insight roots, and the map is keyed by `serializeObjRef(root)`. Disabled
 * parameters return `uninitialized`; backend errors return `failed`.
 */
export async function loadFilterParameterDependencies(
    ctx: DashboardContext,
    filters: ReadonlyArray<FilterContextItem>,
    enableParameters: boolean,
): Promise<ICatalogFilterParametersState> {
    if (!enableParameters) {
        return { status: "uninitialized", byRef: {} };
    }

    const roots = collectFilterParameterRoots(filters);
    if (roots.length === 0) {
        return { status: "loaded", byRef: {} };
    }

    try {
        const byRef = await loadReachableParameterMap(ctx, roots);
        return { status: "loaded", byRef };
    } catch {
        return { status: "failed", byRef: {} };
    }
}

/**
 * Every dashboard filter of the dashboard being initialized: the filters of each tab plus those of the root
 * filter context. The root context is the single tab of a dashboard without tabs, and the tab state keeps
 * it as a default tab even when tabs exist, so it is always included; roots are deduped downstream.
 */
export function collectDashboardFilterContextItems(dashboard: IDashboard): FilterContextItem[] {
    const tabFilters = (dashboard.tabs ?? []).flatMap((tab) => tab.filterContext?.filters ?? []);
    return [...tabFilters, ...(dashboard.filterContext?.filters ?? [])];
}
