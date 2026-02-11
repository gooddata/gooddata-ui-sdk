// (C) 2019-2026 GoodData Corporation

import { type ISettings } from "@gooddata/sdk-model";

import { type TigerOrgSettingsType, type TigerSettingsType } from "../../types/index.js";

// All possible setting types
type AllSettingsType = TigerSettingsType | TigerOrgSettingsType;

// These types are intentionally not mapped to maintain an exhaustive check.
type UnmappedTypes =
    | "OPERATOR_OVERRIDES"
    | "TIMEZONE_VALIDATION_ENABLED"
    | "ENABLE_FILE_ANALYTICS"
    | "JIT_PROVISIONING"
    | "ENABLE_SLIDES_EXPORT"
    | "JWT_JIT_PROVISIONING"
    | "ATTACHMENT_LINK_TTL"
    | "AD_CATALOG_GROUPS_DEFAULT_EXPAND_STATE"
    | "DATA_LOCALE"
    | "LDM_DEFAULT_LOCALE"
    | "EXPORT_RESULT_POLLING_TIMEOUT_SECONDS"
    | "SORT_CASE_SENSITIVE"
    | "EXPORT_CSV_CUSTOM_DELIMITER"
    | "ENABLE_QUERY_TAGS";

// Only mandatory types
type MandatoryTypes = Exclude<AllSettingsType, UnmappedTypes>;

// Mapping from Tiger settings type to ISettings key
const TYPE_TO_KEY_MAP = {
    WHITE_LABELING: "whiteLabeling",
    ALERT: "alertDefault",
    FORMAT_LOCALE: "formatLocale",
    ACTIVE_COLOR_PALETTE: "activeColorPalette",
    ACTIVE_THEME: "activeTheme",
    LOCALE: "locale",
    MAPBOX_TOKEN: "mapboxToken",
    AG_GRID_TOKEN: "agGridToken",
    METADATA_LOCALE: "metadataLocale",
    TIMEZONE: "timezone",
    WEEK_START: "weekStart",
    FISCAL_YEAR: "fiscalYear",
    SHOW_HIDDEN_CATALOG_ITEMS: "showHiddenCatalogItems",
    OPENAI_CONFIG: "openAiConfig",
    DASHBOARD_FILTERS_APPLY_MODE: "dashboardFiltersApplyMode",
    SEPARATORS: "separators",
    organizationSetting: "organizationSetting",
    DATE_FILTER_CONFIG: "dateFilterConfig",
    AI_RATE_LIMIT: "aiRateLimit",
    ACTIVE_LLM_ENDPOINT: "llmEndpoint",
    ATTACHMENT_SIZE_LIMIT: "attachmentSizeLimit",
    ALLOW_UNSAFE_FLEX_CONNECT_ENDPOINTS: "allowUnsafeFlexConnectEndpoints",
    ENABLE_AUTOMATION_EVALUATION_MODE: "enableAutomationEvaluationMode",
    ENABLE_SNAPSHOT_EXPORT: "enableSnapshotExport",
    ENABLE_ACCESSIBILITY_MODE: "enableAccessibilityMode",
    REGISTERED_PLUGGABLE_APPLICATIONS: "registeredPluggableApplications",
    ENABLE_DRILL_TO_URL_BY_DEFAULT: "enableDrillToUrlByDefault",
    METRIC_FORMAT_OVERRIDE: "metricFormatOverride",
    MAX_ZOOM_LEVEL: "maxZoomLevel",
    ACTIVE_CALENDARS: "activeCalendars",
    ENABLE_AI_ON_DATA: "enableAiOnData",
    API_ENTITIES_DEFAULT_CONTENT_MEDIA_TYPE: "apiEntitiesDefaultContentMediaType",
    ENABLE_NULL_JOINS: "enableNullJoins",
} as const satisfies Record<MandatoryTypes, keyof ISettings>;

export function mapTypeToKey(
    type: TigerSettingsType | TigerOrgSettingsType | undefined,
    fallback = "",
): keyof ISettings {
    // For undefined or unmapped type - return fallback
    // exhaustive check is done statically through `satisfies` condition above
    return TYPE_TO_KEY_MAP[type as keyof typeof TYPE_TO_KEY_MAP] ?? fallback;
}
