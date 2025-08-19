// (C) 2021-2025 GoodData Corporation
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes.js";

export async function loadWorkspaceAutomationsCount(ctx: DashboardContext): Promise<number> {
    const { backend, workspace } = ctx;

    const result = await backend.workspace(workspace).automations().getAutomationsQuery().withSize(1).query();

    return result.totalCount ?? 0;
}

export function loadDashboardUserAutomations(
    ctx: DashboardContext,
    dashboardId: string,
    userId: string,
    filterByUser: boolean,
    externalRecipient: string | undefined,
): Promise<IAutomationMetadataObject[]> {
    const { backend, workspace } = ctx;

    let dashboardQuery = backend
        .workspace(workspace)
        .automations()
        .getAutomationsQuery()
        .withSorting(["title,asc", "createdAt,asc"])
        .withDashboard(dashboardId);

    // External recipients from context are prioritized to signed-in user
    if (externalRecipient) {
        dashboardQuery = dashboardQuery.withExternalRecipient(externalRecipient);
    } else if (filterByUser) {
        dashboardQuery = dashboardQuery.withUser(userId);
    }

    return dashboardQuery.queryAll();
}
