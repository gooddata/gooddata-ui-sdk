// (C) 2022 GoodData Corporation
import { IHeaderMenuItem, TUTMContent } from "./typings.js";

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
    const universityLink = universityUrl || "https://university.gooddata.com/page/gooddatacn";
    const communityLink = communityUrl || "https://community.gooddata.com";
    const slackLink = slackUrl || "https://www.gooddata.com/slack/";
    const documentationLink =
        documentationUrl || "https://www.gooddata.com/developers/cloud-native/doc/hosted/";

    return [
        {
            key: "gs.header.slack",
            className: "s-slack",
            iconName: "gd-icon-slack",
            href: addUTMParameters(slackLink, "main_menu_help_slack"),
            target: "_blank",
        },
        {
            key: "gs.header.community",
            className: "s-community",
            iconName: "gd-icon-community",
            href: addUTMParameters(communityLink, "main_menu_help_community"),
            target: "_blank",
        },
        {
            key: "gs.header.university",
            className: "s-university",
            iconName: "gd-icon-university",
            href: addUTMParameters(universityLink, "main_menu_help_university"),
            target: "_blank",
        },
        {
            key: "gs.header.documentation",
            className: "s-documentation",
            iconName: "gd-icon-documentation",
            href: addUTMParameters(documentationLink, "main_menu_help_documentation"),
            target: "_blank",
        },
    ];
}
