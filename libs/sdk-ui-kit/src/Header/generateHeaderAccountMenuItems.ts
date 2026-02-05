// (C) 2007-2026 GoodData Corporation

import { defineMessage } from "react-intl";

import { type ISettings, type IWorkspacePermissions } from "@gooddata/sdk-model";

import { type IHeaderMenuItem } from "./typings.js";

const WORKSPACE_SETTINGS_MENU_ITEM_ID = defineMessage({ id: "gs.header.workspaceSettings" }).id;
/**
 * @internal
 */
export const LOGOUT_MENU_ITEM_ID = defineMessage({ id: "gs.header.logout" }).id;

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
        key: WORKSPACE_SETTINGS_MENU_ITEM_ID,
        className: "s-workspace-settings",
        href: `/workspaces/${workspaceId}/settings`,
    };
    const logoutItem = {
        key: LOGOUT_MENU_ITEM_ID,
        className: "s-logout",
    };

    if (canManageProject && featureFlags?.enableWorkspaceSettingsAppHeaderMenuItem) {
        accountMenuItems.push(workspaceSettingsItem);
    }
    accountMenuItems.push(logoutItem);

    return accountMenuItems;
}
