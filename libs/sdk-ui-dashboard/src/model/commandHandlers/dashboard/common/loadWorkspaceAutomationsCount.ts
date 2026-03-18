// (C) 2021-2026 GoodData Corporation

import { type ISettings } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

export async function loadWorkspaceAutomationsCount(
    ctx: DashboardContext,
    settings: ISettings,
): Promise<number> {
    const { backend, workspace } = ctx;

    if (
        !(settings?.enableScheduling || settings?.enableAlerting) ||
        ctx.config?.isReadOnly ||
        ctx.config?.isExport
    ) {
        return Promise.resolve(0);
    }

    const result = await backend.workspace(workspace).automations().getAutomationsQuery().withSize(1).query();

    return result.totalCount ?? 0;
}
