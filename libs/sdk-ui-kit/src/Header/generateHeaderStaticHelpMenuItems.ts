// (C) 2022 GoodData Corporation
import { IHeaderMenuItem, TUTMContent } from "./typings";

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
export function generateHeaderStaticHelpMenuItems(): IHeaderMenuItem[] {
    const universityUrl = "https://university.gooddata.com/page/gooddatacn";
    const communityUrl = "https://community.gooddata.com";
    const slackUrl = "https://www.gooddata.com/slack/";
    const documentationUrl = "https://www.gooddata.com/developers/cloud-native/doc/";

    return [
        {
            key: "gs.header.slack",
            className: "s-slack",
            iconName: "gd-icon-slack",
            href: addUTMParameters(slackUrl, "main_menu_help_slack"),
            target: "_blank",
        },
        {
            key: "gs.header.community",
            className: "s-community",
            iconName: "gd-icon-community",
            href: addUTMParameters(communityUrl, "main_menu_help_community"),
            target: "_blank",
        },
        {
            key: "gs.header.university",
            className: "s-university",
            iconName: "gd-icon-university",
            href: addUTMParameters(universityUrl, "main_menu_help_university"),
            target: "_blank",
        },
        {
            key: "gs.header.documentation",
            className: "s-documentation",
            iconName: "gd-icon-documentation",
            href: addUTMParameters(documentationUrl, "main_menu_help_documentation"),
            target: "_blank",
        },
    ];
}
