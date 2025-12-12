// (C) 2021-2025 GoodData Corporation
import { type ISettings } from "@gooddata/sdk-model";

import { loadNotificationChannelsCount } from "./loadNotificationChannelsCount.js";
import { loadWorkspaceAutomationsCount } from "./loadWorkspaceAutomationsCount.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

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
