// (C) 2024 GoodData Corporation

import { type IDashboardFilterView } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

export function loadFilterViews(ctx: DashboardContext): Promise<IDashboardFilterView[]> {
    const { backend, workspace } = ctx;

    if (!ctx.dashboardRef || ctx.config?.isReadOnly) {
        return Promise.resolve([]);
    }

    return backend
        .workspace(workspace)
        .dashboards()
        .getFilterViewsForCurrentUser(ctx.dashboardRef)
        .catch((error) => {
            console.error("Loading of the user filter views for the dashboard failed", error);
            return Promise.resolve([]);
        });
}
