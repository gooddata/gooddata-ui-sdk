// (C) 2007-2025 GoodData Corporation
import { defineMessages } from "react-intl";

import { ISettings, IWorkspacePermissions } from "@gooddata/sdk-model";

import { IHeaderMenuItem } from "./typings.js";

const messages = defineMessages({
    workspaceSettingsMenuItem: { id: "gs.header.workspaceSettings" },
    logoutMenuItem: { id: "gs.header.logout" },
});

/**
 * @internal
 */
export interface IUiSettings {
    displayAccountPage: boolean;
}

/**
 * @internal
 */
export function generateHeaderAccountMenuItems(
    workspacePermissions: IWorkspacePermissions,
    workspaceId?: string,
    featureFlags?: ISettings,
): IHeaderMenuItem[] {
    const { canManageProject } = workspacePermissions;
    const accountMenuItems: IHeaderMenuItem[] = [];

    const workspaceSettingsItem = {
        key: messages.workspaceSettingsMenuItem.id,
        className: "s-workspace-settings",
        href: `/workspaces/${workspaceId}/settings`,
    };
    const logoutItem = {
        key: messages.logoutMenuItem.id,
        className: "s-logout",
    };

    if (canManageProject && featureFlags?.enableWorkspaceSettingsAppHeaderMenuItem) {
        accountMenuItems.push(workspaceSettingsItem);
    }
    accountMenuItems.push(logoutItem);

    return accountMenuItems;
}
