// (C) 2024 GoodData Corporation

import { IDashboardFilterView } from "@gooddata/sdk-model";

import { DashboardContext } from "../../../types/commonTypes.js";

export function loadFilterViews(ctx: DashboardContext): Promise<IDashboardFilterView[]> {
    const { backend, workspace } = ctx;

    if (!ctx.dashboardRef) {
        return Promise.resolve([]);
    }

    return backend.workspace(workspace).dashboards().getFilterViewsForCurrentUser(ctx.dashboardRef);
}
