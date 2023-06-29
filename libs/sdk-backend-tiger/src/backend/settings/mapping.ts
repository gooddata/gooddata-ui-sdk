// (C) 2019-2023 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";

import { TigerSettingsType, TigerOrgSettingsType } from "../../types/index.js";

export function mapTypeToKey(
    type: TigerSettingsType | TigerOrgSettingsType | undefined,
    fallback = "",
): keyof ISettings {
    switch (type) {
        case "WHITE_LABELING":
            return "whiteLabeling";
        case "FORMAT_LOCALE":
            return "formatLocale";
        case "ACTIVE_COLOR_PALETTE":
            return "activeColorPalette";
        case "ACTIVE_THEME":
            return "activeTheme";
        case "LOCALE":
            return "locale";
        case "MAPBOX_TOKEN":
            return "mapboxToken";
        case "TIMEZONE":
            return "timezone";
        case "WEEK_START":
            return "weekStart";
        case "organizationSetting":
            return "organizationSetting";
        default:
            return fallback;
    }
}
