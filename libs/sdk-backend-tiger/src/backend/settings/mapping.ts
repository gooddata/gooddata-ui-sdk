// (C) 2019-2025 GoodData Corporation

import { ISettings } from "@gooddata/sdk-model";

import { TigerOrgSettingsType, TigerSettingsType } from "../../types/index.js";

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
        case "AG_GRID_TOKEN":
            return "agGridToken";
        case "METADATA_LOCALE":
            return "metadataLocale";
        case "TIMEZONE":
            return "timezone";
        case "WEEK_START":
            return "weekStart";
        case "FISCAL_YEAR":
            return "fiscalYear";
        case "SHOW_HIDDEN_CATALOG_ITEMS":
            return "showHiddenCatalogItems";
        case "OPENAI_CONFIG":
            return "openAiConfig";
        case "DASHBOARD_FILTERS_APPLY_MODE":
            return "dashboardFiltersApplyMode";
        case "SEPARATORS":
            return "separators";
        case "organizationSetting":
            return "organizationSetting";
        case "DATE_FILTER_CONFIG":
            return "dateFilterConfig";
        case "AI_RATE_LIMIT":
            return "aiRateLimit";
        case "ACTIVE_LLM_ENDPOINT":
            return "llmEndpoint";
        case "ATTACHMENT_SIZE_LIMIT":
            return "attachmentSizeLimit";
        case "ALLOW_UNSAFE_FLEX_CONNECT_ENDPOINTS":
            return "allowUnsafeFlexConnectEndpoints";
        case "ENABLE_AUTOMATION_EVALUATION_MODE":
            return "enableAutomationEvaluationMode";
        case "ENABLE_SNAPSHOT_EXPORT":
            return "enableSnapshotExport";
        case "ENABLE_ACCESSIBILITY_MODE":
            return "enableAccessibilityMode";
        case "REGISTERED_PLUGGABLE_APPLICATIONS":
            return "registeredPluggableApplications";
        case "ENABLE_DRILL_TO_URL_BY_DEFAULT":
            return "enableDrillToUrlByDefault";
        case "METRIC_FORMAT_OVERRIDE":
            return "metricFormatOverride";
        case "MAX_ZOOM_LEVEL":
            return "maxZoomLevel";
        // These cases are intentionally not mapped to maintain an exhaustive check.
        // This ensures we're notified when new properties are added, allowing us to decide if they need mapping.
        case "OPERATOR_OVERRIDES":
        case "TIMEZONE_VALIDATION_ENABLED":
        case "ENABLE_FILE_ANALYTICS":
        case "JIT_PROVISIONING":
        case "ENABLE_SLIDES_EXPORT":
        case "JWT_JIT_PROVISIONING":
        case "ATTACHMENT_LINK_TTL":
        case "AD_CATALOG_GROUPS_DEFAULT_EXPAND_STATE":
        case "DATA_LOCALE":
        case "LDM_DEFAULT_LOCALE":
        case "EXPORT_RESULT_POLLING_TIMEOUT_SECONDS":
        case "SORT_CASE_SENSITIVE":
        case "ENABLE_AI_ON_DATA":
        case undefined:
            return fallback;
        default:
            return exhaustiveCheck(type, fallback);
    }
}

function exhaustiveCheck(_type: never, fallback: string): string {
    return fallback;
}
