// (C) 2021-2024 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";

export async function loadWorkspaceAutomationsCount(
    ctx: DashboardContext,
    settings: ISettings,
): Promise<number> {
    const { backend, workspace } = ctx;

    if (!(settings?.enableScheduling || settings?.enableAlerting) || ctx.config?.isReadOnly) {
        return Promise.resolve(0);
    }

    const result = await backend.workspace(workspace).automations().getAutomationsQuery().withSize(1).query();

    return result.totalCount ?? 0;
}
