// (C) 2021-2026 GoodData Corporation

import { type ISettings } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

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
        loadWorkspaceAutomationsCount(ctx),
    ]);

    return {
        notificationChannelsCount,
        workspaceAutomationsCount,
    };
}
