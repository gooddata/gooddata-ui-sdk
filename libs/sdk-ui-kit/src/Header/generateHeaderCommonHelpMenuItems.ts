// (C) 2026 GoodData Corporation

import { defineMessage } from "react-intl";

import { type IHeaderMenuItem } from "./typings.js";

const HEADER_COMMON_HELP_MENU_ITEM_ID_GETTING_STARTED = defineMessage({
    id: "gs.header.helpMenu.gettingStarted",
}).id;
const HEADER_COMMON_HELP_MENU_ITEM_ID_CONNECT_DATA = defineMessage({
    id: "gs.header.helpMenu.connectData",
}).id;
const HEADER_COMMON_HELP_MENU_ITEM_ID_MANAGE_WORKSPACES = defineMessage({
    id: "gs.header.helpMenu.manage.ws",
}).id;
const HEADER_COMMON_HELP_MENU_ITEM_ID_MANAGE_USERS = defineMessage({
    id: "gs.header.helpMenu.manage.user",
}).id;

/**
 * Product-wide contextual help links, valid in any application.
 *
 * @remarks
 * Prepend these to {@link generateHeaderStaticHelpMenuItems} to build a help menu. The last item
 * carries the divider class, so append the static items directly after it.
 *
 * @internal
 */
export function generateHeaderCommonHelpMenuItems(): IHeaderMenuItem[] {
    return [
        {
            key: HEADER_COMMON_HELP_MENU_ITEM_ID_GETTING_STARTED,
            className: "s-getting-started",
            href: "https://www.gooddata.com/developers/cloud-native/doc/cloud/getting-started/",
            target: "_blank",
        },
        {
            key: HEADER_COMMON_HELP_MENU_ITEM_ID_CONNECT_DATA,
            className: "s-connect-data",
            href: "https://www.gooddata.com/developers/cloud-native/doc/cloud/getting-started/connect-data/",
            target: "_blank",
        },
        {
            key: HEADER_COMMON_HELP_MENU_ITEM_ID_MANAGE_WORKSPACES,
            className: "s-manage-workspaces",
            href: "https://www.gooddata.com/developers/cloud-native/doc/cloud/manage-deployment/manage-workspaces/",
            target: "_blank",
        },
        {
            key: HEADER_COMMON_HELP_MENU_ITEM_ID_MANAGE_USERS,
            className: "s-manage-users gd-menu-item-divider",
            href: "https://www.gooddata.com/developers/cloud-native/doc/cloud/manage-deployment/manage-users/",
            target: "_blank",
        },
    ];
}
