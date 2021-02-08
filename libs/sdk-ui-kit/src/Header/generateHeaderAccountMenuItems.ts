// (C) 2007-2021 GoodData Corporation
import { IHeaderMenuItem } from "./Header";
import { IWorkspacePermissions } from "@gooddata/sdk-backend-spi";

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
): IHeaderMenuItem[] {
    const { canInitData } = workspacePermissions;
    const { displayAccountPage } = uiSettings;
    const accountMenuItems: IHeaderMenuItem[] = [];

    const accountItem = {
        key: "gs.header.account",
        className: "s-account",
        href: `/#s=/gdc/projects/${workspaceId}|accountPage|`,
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

    const showAccountItem = workspaceId && displayAccountPage && !showOnlyLogoutItem;
    const showDataIntegrationConsoleItem = canInitData === true && !showOnlyLogoutItem;

    if (showAccountItem) {
        accountMenuItems.push(accountItem);
    }
    if (showDataIntegrationConsoleItem) {
        accountMenuItems.push(dataIntegrationConsoleItem);
    }
    accountMenuItems.push(logoutItem);

    return accountMenuItems;
}
