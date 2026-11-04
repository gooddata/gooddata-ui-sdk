// (C) 2007-2026 GoodData Corporation

import { defineMessage } from "react-intl";

import { type IFeatureFlags, type IWorkspacePermissions, LANGUAGE_NAMES } from "@gooddata/sdk-model";
import { type ILocale } from "@gooddata/sdk-ui";

import { type IHeaderMenuItem } from "./typings.js";

// Use a constant with defineMessage so that i18n validation does not mark it as unused
/**
 * @internal
 */
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
    featureFlags: IFeatureFlags;
    currentLanguage: ILocale;
}

/**
 * @internal
 */
export function generateHeaderAccountMenuItems(
    workspacePermissions: IWorkspacePermissions,
    { workspaceId, featureFlags, currentLanguage }: IGenerateHeaderAccountMenuItemsOptions,
): IHeaderMenuItem[] {
    const { canManageProject } = workspacePermissions;
    const accountMenuItems: IHeaderMenuItem[] = [];

    // The org-scoped home-ui module under "/organization/settings" maps
    // ".../workspaces/:workspaceId/settings" onto the configuration page.
    const workspaceSettingsItem = {
        key: WORKSPACE_SETTINGS_MENU_ITEM_ID,
        className: "s-workspace-settings",
        href: `/organization/settings/workspaces/${workspaceId}/settings`,
    };
    const logoutItem = {
        key: LOGOUT_MENU_ITEM_ID,
        className: "s-logout",
    };

    if (featureFlags.enableUserLanguageChange) {
        accountMenuItems.push({
            key: LANGUAGE_MENU_ITEM_ID,
            value: LANGUAGE_NAMES[currentLanguage].nativeName,
        });
    }
    if (canManageProject && featureFlags.enableWorkspaceSettingsAppHeaderMenuItem) {
        accountMenuItems.push(workspaceSettingsItem);
    }
    accountMenuItems.push(logoutItem);

    return accountMenuItems;
}
