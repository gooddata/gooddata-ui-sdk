// (C) 2020-2026 GoodData Corporation

import { defineMessage } from "react-intl";

import { type ISettings } from "@gooddata/sdk-model";

import { type IHeaderMenuItem, type TUTMContent } from "./typings.js";
import { generateSupportUrl } from "../utils/featureFlags.js";

const HEADER_HELP_MENU_ITEM_ID_DOCUMENTATION = defineMessage({ id: "gs.header.documentation" }).id;
const HEADER_HELP_MENU_ITEM_ID_UNIVERSITY = defineMessage({ id: "gs.header.university" }).id;
const HEADER_HELP_MENU_ITEM_ID_COMMUNITY = defineMessage({ id: "gs.header.community" }).id;
const HEADER_HELP_MENU_ITEM_ID_VISIT_SUPPORT_PORTAL = defineMessage({
    id: "gs.header.visitSupportPortal",
}).id;
const HEADER_HELP_MENU_ITEM_ID_SUBMIT_TICKET = defineMessage({ id: "gs.header.submitTicket" }).id;

/**
 * @internal
 */
const addUTMParameters = (baseUrl: string, utmContent: TUTMContent, isBranded = false): string =>
    isBranded
        ? baseUrl
        : `${baseUrl}${
              baseUrl.includes("?") ? "&" : "?"
          }utm_medium=platform&utm_source=product&utm_content=${utmContent}`;

/**
 * @internal
 */
export function generateHeaderHelpMenuItems(
    documentationUrl?: string,
    supportForumUrl?: string,
    userEmail?: string,
    workspaceId?: string,
    sessionId?: string,
    supportEmail?: string,
    isBranded?: boolean,
    featureFlags: ISettings = {},
): IHeaderMenuItem[] {
    const universityUrl = "https://university.gooddata.com";
    const communityUrl = "https://community.gooddata.com";
    const { enableUniversityHelpMenuItem, enableCommunityHelpMenuItem } = featureFlags;
    const helpMenuItems: IHeaderMenuItem[] = [];

    if (documentationUrl) {
        helpMenuItems.push({
            key: HEADER_HELP_MENU_ITEM_ID_DOCUMENTATION,
            className: "s-documentation",
            href: addUTMParameters(documentationUrl, "main_menu_help_documentation", isBranded),
            target: "_blank",
        });
    }

    if (enableUniversityHelpMenuItem && !isBranded) {
        helpMenuItems.push({
            key: HEADER_HELP_MENU_ITEM_ID_UNIVERSITY,
            className: "s-university",
            href: addUTMParameters(universityUrl, "main_menu_help_university", isBranded),
            target: "_blank",
        });
    }

    if (enableCommunityHelpMenuItem && !isBranded) {
        helpMenuItems.push({
            key: HEADER_HELP_MENU_ITEM_ID_COMMUNITY,
            className: "s-community",
            href: addUTMParameters(communityUrl, "main_menu_help_community", isBranded),
            target: "_blank",
        });
    }

    if (supportForumUrl) {
        helpMenuItems.push({
            key: HEADER_HELP_MENU_ITEM_ID_VISIT_SUPPORT_PORTAL,
            className: "s-support-portal",
            href: addUTMParameters(supportForumUrl, "main_menu_help_support", isBranded),
            target: "_blank",
        });
    }

    if (!isBranded) {
        const supportUrl = generateSupportUrl(workspaceId, sessionId, userEmail, window.location.href);
        helpMenuItems.push({
            key: HEADER_HELP_MENU_ITEM_ID_SUBMIT_TICKET,
            className: "s-submit-ticket",
            href: addUTMParameters(supportUrl, "main_menu_help_ticket", isBranded),
            target: "_blank",
        });
    } else if (supportEmail) {
        helpMenuItems.push({
            key: HEADER_HELP_MENU_ITEM_ID_SUBMIT_TICKET,
            className: "s-submit-ticket",
            href: `mailto:${supportEmail}`,
            target: "_blank",
        });
    }

    return helpMenuItems;
}
