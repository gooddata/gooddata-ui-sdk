// (C) 2007-2025 GoodData Corporation
import { ISettings, IWorkspacePermissions } from "@gooddata/sdk-model";

import { IHeaderMenuItem } from "./typings.js";

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
    workspacePermissions: IWorkspacePermissions, // bootstrapResource.current.projectPermissions
    uiSettings: IUiSettings, // bootstrapResource.settings
    workspaceId?: string, // parsed from bootstrapResource.current.project.links.self
    showOnlyLogoutItem?: boolean,
    featureFlags?: ISettings,
): IHeaderMenuItem[] {
    const { canInitData, canManageProject } = workspacePermissions;
    const { displayAccountPage } = uiSettings;
    const accountMenuItems: IHeaderMenuItem[] = [];
    const workspaceRef = featureFlags?.enableRenamingProjectToWorkspace ? "workspaces" : "projects";

    const accountItem = {
        key: "gs.header.account",
        className: "s-account",
        href: `/#s=/gdc/${workspaceRef}/${workspaceId}|accountPage|`,
    };
    const dataIntegrationConsoleItem = {
        key: "gs.header.dic",
        className: "s-dic",
        href: "/admin/disc/",
    };
    const logoutItem = {
        key: "gs.header.logout",
        className: "s-logout",
    };
    const workspaceSettingsItem = {
        key: "gs.header.workspaceSettings",
        className: "s-workspace-settings",
        href: `/workspaces/${workspaceId}/settings`,
    };

    const showAccountItem = workspaceId && displayAccountPage && !showOnlyLogoutItem;
    const showDataIntegrationConsoleItem = canInitData === true && !showOnlyLogoutItem;

    if (showAccountItem) {
        accountMenuItems.push(accountItem);
    }
    if (showDataIntegrationConsoleItem) {
        accountMenuItems.push(dataIntegrationConsoleItem);
    }
    if (canManageProject && featureFlags?.enableWorkspaceSettingsAppHeaderMenuItem) {
        accountMenuItems.push(workspaceSettingsItem);
    }
    accountMenuItems.push(logoutItem);

    return accountMenuItems;
}
