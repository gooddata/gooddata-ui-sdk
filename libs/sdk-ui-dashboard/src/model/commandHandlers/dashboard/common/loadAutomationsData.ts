// (C) 2021-2025 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";
import { loadNotificationChannelsCount } from "./loadNotificationChannelsCount.js";
import { loadWorkspaceAutomationsCount } from "./loadWorkspaceAutomationsCount.js";

export async function loadAutomationsData(
    ctx: DashboardContext,
    settings: ISettings,
): Promise<{
    notificationChannelsCount: number;
    workspaceAutomationsCount: number;
}> {
    const [notificationChannelsCount, workspaceAutomationsCount] = await Promise.all([
        loadNotificationChannelsCount(ctx, settings),
        loadWorkspaceAutomationsCount(ctx, settings),
    ]);

    return {
        notificationChannelsCount,
        workspaceAutomationsCount,
    };
}
