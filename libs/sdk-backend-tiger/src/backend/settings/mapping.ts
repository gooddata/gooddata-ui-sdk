// (C) 2019-2024 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";

import { TigerSettingsType, TigerOrgSettingsType } from "../../types/index.js";

export function mapTypeToKey(
    type: TigerSettingsType | TigerOrgSettingsType | undefined,
    fallback = "",
): keyof ISettings {
    switch (type) {
        case "WHITE_LABELING":
            return "whiteLabeling";
        case "ALERT":
            return "alertDefault";
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
        case "SHOW_HIDDEN_CATALOG_ITEMS":
            return "showHiddenCatalogItems";
        case "OPENAI_CONFIG":
            return "openAiConfig";
        case "SEPARATORS":
            return "separators";
        case "organizationSetting":
            return "organizationSetting";
        // These cases are intentionally not mapped to maintain an exhaustive check.
        // This ensures we're notified when new properties are added, allowing us to decide if they need mapping.
        case "METADATA_LOCALE":
        case "OPERATOR_OVERRIDES":
        case "TIMEZONE_VALIDATION_ENABLED":
        case "ENABLE_FILE_ANALYTICS":
        case undefined:
            return fallback;
        default:
            return exhaustiveCheck(type, fallback);
    }
}

function exhaustiveCheck(_type: never, fallback: string): string {
    return fallback;
}
