// (C) 2021-2026 GoodData Corporation

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../types/commonTypes.js";

export async function loadWorkspaceAutomationsCount({
    backend,
    workspace,
}: DashboardContext): Promise<number> {
    const result = await backend.workspace(workspace).automations().getAutomationsQuery().withSize(1).query();

    return result.totalCount ?? 0;
}

export interface ILoadDashboardUserAutomationsOptions {
    dashboardId: string;
    userId: string;
    filterByUser: boolean;
    externalRecipient: string | undefined;
    includeUnavailableReferences: boolean;
}

export function loadDashboardUserAutomations(
    ctx: DashboardContext,
    {
        dashboardId,
        userId,
        filterByUser,
        externalRecipient,
        includeUnavailableReferences,
    }: ILoadDashboardUserAutomationsOptions,
): Promise<IAutomationMetadataObject[]> {
    const { backend, workspace } = ctx;

    let dashboardQuery = backend
        .workspace(workspace)
        .automations()
        .getAutomationsQuery({ includeUnavailableReferences })
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
