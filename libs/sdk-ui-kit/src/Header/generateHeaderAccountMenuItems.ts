// (C) 2007-2026 GoodData Corporation

import { defineMessage } from "react-intl";

import { type IFeatureFlags, type IWorkspacePermissions } from "@gooddata/sdk-model";

import { type IHeaderMenuItem } from "./typings.js";

// Use a constant with defineMessage so that i18n validation does not mark it as unused
export const LANGUAGE_MENU_ITEM_ID = defineMessage({ id: "userMenu.language" }).id;
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
export interface IGenerateHeaderAccountMenuItemsOptions {
    workspaceId?: string;
    featureFlags?: IFeatureFlags;
}

/**
 * @internal
 */
export function generateHeaderAccountMenuItems(
    workspacePermissions: IWorkspacePermissions,
    { workspaceId, featureFlags }: IGenerateHeaderAccountMenuItemsOptions = {},
): IHeaderMenuItem[] {
    const { canManageProject } = workspacePermissions;
    const accountMenuItems: IHeaderMenuItem[] = [];

    // When the shell (host) application is enabled, workspace settings are served by the
    // org-scoped home-ui module mounted under "/organization/settings"; its router maps
    // ".../workspaces/:workspaceId/settings" onto the configuration page. In legacy standalone
    // mode the same path is served directly from the root. This mirrors the logoHref convention
    // used by the app runtimes (enableShellApplication ? "/organization/settings" : "/").
    const workspaceSettingsBasePath = featureFlags?.enableShellApplication ? "/organization/settings" : "";
    const workspaceSettingsItem = {
        key: WORKSPACE_SETTINGS_MENU_ITEM_ID,
        className: "s-workspace-settings",
        href: `${workspaceSettingsBasePath}/workspaces/${workspaceId}/settings`,
    };
    const logoutItem = {
        key: LOGOUT_MENU_ITEM_ID,
        className: "s-logout",
    };

    if (featureFlags?.enableUserLanguageChange) {
        accountMenuItems.push({ key: LANGUAGE_MENU_ITEM_ID });
    }
    if (canManageProject && featureFlags?.enableWorkspaceSettingsAppHeaderMenuItem) {
        accountMenuItems.push(workspaceSettingsItem);
    }
    accountMenuItems.push(logoutItem);

    return accountMenuItems;
}
