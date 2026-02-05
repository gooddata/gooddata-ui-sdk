// (C) 2022-2026 GoodData Corporation

import { defineMessage } from "react-intl";

import { type IHeaderMenuItem, type TUTMContent } from "./typings.js";

const HEADER_STATIC_HELP_MENU_ITEM_ID_SLACK = defineMessage({ id: "gs.header.slack" }).id;
const HEADER_STATIC_HELP_MENU_ITEM_ID_COMMUNITY = defineMessage({ id: "gs.header.community" }).id;
const HEADER_STATIC_HELP_MENU_ITEM_ID_UNIVERSITY = defineMessage({ id: "gs.header.university" }).id;
const HEADER_STATIC_HELP_MENU_ITEM_ID_DOCUMENTATION = defineMessage({ id: "gs.header.documentation" }).id;

/**
 * @internal
 */
const addUTMParameters = (baseUrl: string, utmContent: TUTMContent): string =>
    `${baseUrl}${
        baseUrl.includes("?") ? "&" : "?"
    }utm_medium=platform&utm_source=product&utm_content=${utmContent}`;

/**
 * @internal
 */
export function generateHeaderStaticHelpMenuItems(
    documentationUrl?: string,
    communityUrl?: string,
    universityUrl?: string,
    slackUrl?: string,
): IHeaderMenuItem[] {
    const universityLink = universityUrl || "https://university.gooddata.com";
    const communityLink = communityUrl || "https://community.gooddata.com";
    const slackLink = slackUrl || "https://www.gooddata.com/slack/";
    const documentationLink =
        documentationUrl || "https://www.gooddata.com/developers/cloud-native/doc/hosted/";

    return [
        {
            key: HEADER_STATIC_HELP_MENU_ITEM_ID_SLACK,
            className: "s-slack",
            iconName: "gd-icon-slack",
            href: addUTMParameters(slackLink, "main_menu_help_slack"),
            target: "_blank",
        },
        {
            key: HEADER_STATIC_HELP_MENU_ITEM_ID_COMMUNITY,
            className: "s-community",
            iconName: "gd-icon-community",
            href: addUTMParameters(communityLink, "main_menu_help_community"),
            target: "_blank",
        },
        {
            key: HEADER_STATIC_HELP_MENU_ITEM_ID_UNIVERSITY,
            className: "s-university",
            iconName: "gd-icon-university",
            href: addUTMParameters(universityLink, "main_menu_help_university"),
            target: "_blank",
        },
        {
            key: HEADER_STATIC_HELP_MENU_ITEM_ID_DOCUMENTATION,
            className: "s-documentation",
            iconName: "gd-icon-documentation",
            href: addUTMParameters(documentationLink, "main_menu_help_documentation"),
            target: "_blank",
        },
    ];
}
