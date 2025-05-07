// (C) 2007-2025 GoodData Corporation
import { ISettings, IWorkspacePermissions } from "@gooddata/sdk-model";
import { defineMessages } from "react-intl";

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
    uiSettings: IUiSettings,
    workspaceId?: string,
    showOnlyLogoutItem?: boolean,
    featureFlags?: ISettings,
): IHeaderMenuItem[];
/**
 * @internal
 */
export function generateHeaderAccountMenuItems(
    workspacePermissions: IWorkspacePermissions,
    workspaceId?: string,
    featureFlags?: ISettings,
): IHeaderMenuItem[];
/**
 * @internal
 */
export function generateHeaderAccountMenuItems(
    workspacePermissions: IWorkspacePermissions,
    uiSettingsOrWorkspaceId?: IUiSettings | string,
    workspaceIdOrFeatureFlags?: string | ISettings,
    _showOnlyLogoutItem?: boolean,
    featureFlags?: ISettings,
): IHeaderMenuItem[] {
    const workspaceId =
        typeof uiSettingsOrWorkspaceId === "string"
            ? uiSettingsOrWorkspaceId
            : (workspaceIdOrFeatureFlags as string);
    const featureFlagsFinal =
        typeof workspaceIdOrFeatureFlags === "string" ? featureFlags : workspaceIdOrFeatureFlags;

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

    if (canManageProject && featureFlagsFinal?.enableWorkspaceSettingsAppHeaderMenuItem) {
        accountMenuItems.push(workspaceSettingsItem);
    }
    accountMenuItems.push(logoutItem);

    return accountMenuItems;
}
