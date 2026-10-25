// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IActiveCalendars, type ObjectVisibility, type WeekStart } from "@gooddata/sdk-model";
import { type AttributeFilterAvailableSelectionType } from "@gooddata/sdk-ui-filters";

import { isBranded } from "../selectors/bootstrap_selector.js";
import { getFeatureFlagsState } from "../store/feature_flags/feature_flags_selectors.js";
import { type IAppState } from "../store/types.js";

export type PlatformEditionConfig = "free" | "growth" | "enterprise";

type FeatureFlag =
    | "activeFiltersByDefault"
    | "cellMergedByDefault"
    | "enableRadarChart"
    | "enableMekkoChart"
    | "platformEdition"
    | "portalLogoPage"
    | "enableEmbeddingWriteCommands"
    | "adFormattingDocumentationLink"
    | "approximateCountAvailable"
    | "responsiveUiDateFormat"
    | "dataSamplingAvailable"
    | "showAllValuesOnDatesAvailable"
    | "enableEmbedButtonInAD"
    | "weekStartOnMondayEnabled"
    | "enableNewUIWeekStartChange"
    | "weekStart"
    | "metadataTimeZone"
    | "showHiddenCatalogItems"
    | "enableGeoArea"
    | "enableHLL"
    | "enableNewInsightChangedPostMessageEvent"
    | "enableSemanticSearch"
    | "enableRankingWithMvf"
    | "enableRankingStrictLimit"
    | "enableImprovedRankingFilter"
    | "enableRawExports"
    | "enableAnalyticalDesignerCatalogSideload"
    | "enableExportToDocumentStorage"
    | "enableFiscalCalendars"
    | "enableNewPivotTable"
    | "enableNewGeoPushpin"
    | "enableGeoChartA11yImprovements"
    | "enableGeoChartsViewportConfig"
    | "enableGeoSegmentConflictRecommendation"
    | "enableAccessibilityMode"
    | "exportResultPollingTimeoutSeconds"
    | "enableVisualizationFilteringByTags"
    | "restrictBaseUi"
    | "enableShellApplication"
    | "enableParameters"
    | "enableStringParameters"
    | "enableEnhancedInsightPicker"
    | "enableDashboardTimezone"
    | "enableMetricPermissions"
    | "enableVisualizationPermissions"
    | "enableGenAiRightPanel"
    | "enableComputedAttributes"
    | "enableCollapsibleLeftSidebar";

type FeatureFlagKey =
    | "ACTIVE_FILTERS_BY_DEFAULT"
    | "CELL_MERGED_BY_DEFAULT"
    | "ENABLE_RADAR_CHART"
    | "ENABLE_MEKKO_CHART"
    | "ENABLE_GEO_AREA"
    | "ENABLE_HLL"
    | "PLATFORM_EDITION"
    | "ENABLE_EMBEDDING_WRITE_COMMANDS"
    | "AD_FORMATTING_DOCUMENTATION_LINK"
    | "ENABLE_APPROX_COUNT"
    | "ENABLE_DATA_SAMPLING"
    | "ENABLE_SHOW_ALL_VALUES_ON_DATES"
    | "RESPONSIVE_UI_DATE_FORMAT"
    | "ENABLE_EMBED_BUTTON_IN_AD"
    | "WEEK_START"
    | "METADATA_TIME_ZONE"
    | "SHOW_HIDDEN_CATALOG_ITEMS"
    | "ENABLE_RANKING_WITH_MVF"
    | "ENABLE_RANKING_STRICT_LIMIT"
    | "ENABLE_IMPROVED_RANKING_FILTER"
    | "ENABLE_NEW_INSIGHT_CHANGED_POST_MESSAGE_EVENT"
    | "ENABLE_SEMANTIC_SEARCH"
    | "ENABLE_RAW_EXPORTS"
    | "ENABLE_ANALYTICAL_DESIGNER_CATALOG_SIDELOAD"
    | "ENABLE_EXPORT_TO_DOCUMENT_STORAGE"
    | "ENABLE_FISCAL_CALENDARS"
    | "ENABLE_NEW_PIVOT_TABLE"
    | "ENABLE_NEW_GEO_PUSHPIN"
    | "ENABLE_GEO_CHART_A11Y_IMPROVEMENTS"
    | "ENABLE_GEO_CHARTS_VIEWPORT_CONFIG"
    | "ENABLE_GEO_SEGMENT_CONFLICT_RECOMMENDATION"
    | "ENABLE_ACCESSIBILITY_MODE"
    | "EXPORT_RESULT_POLLING_TIMEOUT_SECONDS"
    | "ENABLE_VISUALIZATION_FILTERING_BY_TAGS"
    | "RESTRICT_BASE_UI"
    | "ENABLE_SHELL_APPLICATION"
    | "ENABLE_PARAMETERS"
    | "ENABLE_STRING_PARAMETERS"
    | "ENABLE_ENHANCED_INSIGHT_PICKER"
    | "ENABLE_METRIC_PERMISSIONS"
    | "ENABLE_VISUALIZATION_PERMISSIONS"
    | "ENABLE_GEN_AI_RIGHT_PANEL"
    | "ENABLE_COMPUTED_ATTRIBUTES"
    | "ENABLE_COLLAPSIBLE_LEFT_SIDEBAR";

export const FEATURE_FLAGS: {
    [key in FeatureFlagKey]: FeatureFlag;
} = {
    ACTIVE_FILTERS_BY_DEFAULT: "activeFiltersByDefault",
    CELL_MERGED_BY_DEFAULT: "cellMergedByDefault",
    ENABLE_RADAR_CHART: "enableRadarChart",
    ENABLE_MEKKO_CHART: "enableMekkoChart",
    ENABLE_GEO_AREA: "enableGeoArea",
    ENABLE_HLL: "enableHLL",
    PLATFORM_EDITION: "platformEdition",
    ENABLE_EMBEDDING_WRITE_COMMANDS: "enableEmbeddingWriteCommands",
    AD_FORMATTING_DOCUMENTATION_LINK: "adFormattingDocumentationLink",
    ENABLE_APPROX_COUNT: "approximateCountAvailable",
    ENABLE_DATA_SAMPLING: "dataSamplingAvailable",
    ENABLE_SHOW_ALL_VALUES_ON_DATES: "showAllValuesOnDatesAvailable",
    RESPONSIVE_UI_DATE_FORMAT: "responsiveUiDateFormat",
    ENABLE_EMBED_BUTTON_IN_AD: "enableEmbedButtonInAD",
    WEEK_START: "weekStart",
    METADATA_TIME_ZONE: "metadataTimeZone",
    SHOW_HIDDEN_CATALOG_ITEMS: "showHiddenCatalogItems",
    ENABLE_RANKING_WITH_MVF: "enableRankingWithMvf",
    ENABLE_RANKING_STRICT_LIMIT: "enableRankingStrictLimit",
    ENABLE_IMPROVED_RANKING_FILTER: "enableImprovedRankingFilter",
    ENABLE_NEW_INSIGHT_CHANGED_POST_MESSAGE_EVENT: "enableNewInsightChangedPostMessageEvent",
    ENABLE_SEMANTIC_SEARCH: "enableSemanticSearch",
    ENABLE_RAW_EXPORTS: "enableRawExports",
    ENABLE_ANALYTICAL_DESIGNER_CATALOG_SIDELOAD: "enableAnalyticalDesignerCatalogSideload",
    ENABLE_EXPORT_TO_DOCUMENT_STORAGE: "enableExportToDocumentStorage",
    ENABLE_FISCAL_CALENDARS: "enableFiscalCalendars",
    ENABLE_NEW_PIVOT_TABLE: "enableNewPivotTable",
    ENABLE_NEW_GEO_PUSHPIN: "enableNewGeoPushpin",
    ENABLE_GEO_CHART_A11Y_IMPROVEMENTS: "enableGeoChartA11yImprovements",
    ENABLE_GEO_CHARTS_VIEWPORT_CONFIG: "enableGeoChartsViewportConfig",
    ENABLE_GEO_SEGMENT_CONFLICT_RECOMMENDATION: "enableGeoSegmentConflictRecommendation",
    ENABLE_ACCESSIBILITY_MODE: "enableAccessibilityMode",
    EXPORT_RESULT_POLLING_TIMEOUT_SECONDS: "exportResultPollingTimeoutSeconds",
    ENABLE_VISUALIZATION_FILTERING_BY_TAGS: "enableVisualizationFilteringByTags",
    RESTRICT_BASE_UI: "restrictBaseUi",
    ENABLE_SHELL_APPLICATION: "enableShellApplication",
    ENABLE_PARAMETERS: "enableParameters",
    ENABLE_STRING_PARAMETERS: "enableStringParameters",
    ENABLE_ENHANCED_INSIGHT_PICKER: "enableEnhancedInsightPicker",
    ENABLE_METRIC_PERMISSIONS: "enableMetricPermissions",
    ENABLE_VISUALIZATION_PERMISSIONS: "enableVisualizationPermissions",
    ENABLE_COMPUTED_ATTRIBUTES: "enableComputedAttributes",
    ENABLE_GEN_AI_RIGHT_PANEL: "enableGenAiRightPanel",
    ENABLE_COLLAPSIBLE_LEFT_SIDEBAR: "enableCollapsibleLeftSidebar",
};

export const getFeatureFlags = (appState: IAppState): IUserWorkspaceSettings =>
    getFeatureFlagsState(appState) as IUserWorkspaceSettings;

export const isActiveFiltersByDefault = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ACTIVE_FILTERS_BY_DEFAULT] ?? true) as boolean,
);

export const isCellMergedByDefault = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.CELL_MERGED_BY_DEFAULT] ?? true) as boolean,
);

export const isEnabledRadarChart = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_RADAR_CHART] ?? false) as boolean,
);

export const isEnabledMekkoChart = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_MEKKO_CHART] ?? false) as boolean,
);

export const getPlatformEditionConfig = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.PLATFORM_EDITION] ?? "enterprise") as PlatformEditionConfig,
);

export const isFreemiumEdition = createSelector(
    [getPlatformEditionConfig],
    (platformEdition) => platformEdition && (platformEdition === "free" || platformEdition === "growth"),
);

export const isFreeEdition = createSelector(
    [getPlatformEditionConfig],
    (platformEdition) => platformEdition && platformEdition === "free",
);

export const isEmbeddingWriteCommandsEnabled = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_EMBEDDING_WRITE_COMMANDS] ?? false) as boolean,
);

export const getCatalogGroupsExpanded = createSelector(
    getFeatureFlags,
    (configs) => !!configs["ADCatalogGroupsExpanded"],
);

export const getWeekStart = createSelector([getFeatureFlags], (configs) => {
    if (configs[FEATURE_FLAGS.WEEK_START] !== undefined) {
        return configs[FEATURE_FLAGS.WEEK_START] as WeekStart;
    }

    return "Sunday" as WeekStart;
});

export const getFormattingDocumentationLink = createSelector(
    [getFeatureFlags, isBranded],
    (configs, isWhiteLabeled) =>
        !isWhiteLabeled && (configs[FEATURE_FLAGS.AD_FORMATTING_DOCUMENTATION_LINK] as string),
);

export const getEnableEmbedButtonInAD = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_EMBED_BUTTON_IN_AD] ?? true) as boolean,
);

export function getUserId(appState: IAppState): string {
    const settings = getFeatureFlags(appState);
    return settings.userId;
}

export const isDataSamplingEnabled = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_DATA_SAMPLING] ?? false) as boolean,
);

export const isShowAllValuesOnDatesEnabled = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_SHOW_ALL_VALUES_ON_DATES] ?? false) as boolean,
);

export const isApproxCountEnabled = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_APPROX_COUNT] ?? false) as boolean,
);

export const getDateFormatConfig = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.RESPONSIVE_UI_DATE_FORMAT] ?? "MM/dd/yyyy") as string,
);

export const getMetadataTimeZone = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.METADATA_TIME_ZONE] ?? "UTC") as string,
);

export const enableUnavailableItemsVisibility = createSelector(
    [getFeatureFlags],
    (configs) => configs.showHiddenCatalogItems ?? false,
);

export const enableCatalogSmartSearchResults = createSelector(
    [getFeatureFlags],
    (configs) => configs.enableCatalogSmartSearchResults ?? false,
);

export const enableRankingWithMvf = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_RANKING_WITH_MVF] ?? false) as boolean,
);

export const enableRankingStrictLimit = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_RANKING_STRICT_LIMIT] ?? true) as boolean,
);

export const enableImprovedRankingFilter = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_IMPROVED_RANKING_FILTER] ?? true) as boolean,
);

export const enableParameters = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_PARAMETERS] ?? false) as boolean,
);

export const enableStringParameters = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_STRING_PARAMETERS] ?? true) as boolean,
);

export const enableNewInsightChangedPostMessageEvent = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_NEW_INSIGHT_CHANGED_POST_MESSAGE_EVENT] ?? false) as boolean,
);

export const enableSemanticSearch = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_SEMANTIC_SEARCH] ?? false) as boolean,
);

export const enableMetricPermissions = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_METRIC_PERMISSIONS] ?? false) as boolean,
);

export const enableVisualizationPermissions = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_VISUALIZATION_PERMISSIONS] ?? false) as boolean,
);

export const getDefaultMetricVisibility = createSelector(
    [getFeatureFlags],
    (flags): ObjectVisibility => flags?.defaultMetricVisibility ?? "RESTRICTED",
);

export const getDefaultVisualizationVisibility = createSelector(
    [getFeatureFlags],
    (flags): ObjectVisibility => flags?.defaultVisualizationVisibility ?? "RESTRICTED",
);

export const enableRawExports = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_RAW_EXPORTS] ?? false) as boolean,
);

export const enableAnalyticalDesignerCatalogSideload = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_ANALYTICAL_DESIGNER_CATALOG_SIDELOAD] ?? true) as boolean,
);

export const enableExportToDocumentStorage = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_EXPORT_TO_DOCUMENT_STORAGE] ?? false) as boolean,
);

export const enableFiscalCalendars = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_FISCAL_CALENDARS] ?? true) as boolean,
);

export const getActiveCalendars = createSelector(
    [getFeatureFlags, enableFiscalCalendars],
    (flags, ffEnabled): IActiveCalendars | undefined => {
        const activeCalendars = flags?.activeCalendars;
        if (!ffEnabled) {
            return activeCalendars ? { ...activeCalendars, fiscal: false } : undefined;
        }
        if (!activeCalendars) {
            return undefined;
        }
        // If no calendar type is enabled, default to standard
        const hasAnyCalendarEnabled = Object.entries(activeCalendars).some(([_, value]) => value === true);
        if (!hasAnyCalendarEnabled) {
            return { ...activeCalendars, standard: true };
        }
        return activeCalendars;
    },
);

export const enableNewPivotTable = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_NEW_PIVOT_TABLE] ?? true) as boolean,
);

export const enableSecondGranularities = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.enableSecondGranularities ?? true) as boolean,
);

export const enableImprovedMetricDateFilter = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.enableImprovedMetricDateFilter ?? false) as boolean,
);

export const enableGeoArea = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_GEO_AREA] ?? false) as boolean,
);

export const enableHLL = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_HLL] ?? false) as boolean,
);

export const enableNewGeoPushpin = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_NEW_GEO_PUSHPIN] ?? false) as boolean,
);

export const enableGeoChartA11yImprovements = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_GEO_CHART_A11Y_IMPROVEMENTS] ?? false) as boolean,
);

export const enableGeoChartsViewportConfig = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_GEO_CHARTS_VIEWPORT_CONFIG] ?? true) as boolean,
);

export const enableGeoSegmentConflictRecommendation = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_GEO_SEGMENT_CONFLICT_RECOMMENDATION] ?? false) as boolean,
);

export const isAccessibilityModeEnabled = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_ACCESSIBILITY_MODE] ?? false) as boolean,
);

/**
 * Returns the timeout to use when polling for export results (in milliseconds).
 */
export const exportResultTimeout = createSelector([getFeatureFlags], (flags) => {
    const value = flags?.[FEATURE_FLAGS.EXPORT_RESULT_POLLING_TIMEOUT_SECONDS] as number | undefined;
    if (value) {
        return value * 1000;
    }
    return undefined;
});

/**
 * Returns whether metric format overrides feature is enabled.
 * When enabled, users can set metric type (e.g., CURRENCY) and format overrides are respected.
 */
export const enableMetricFormatOverrides = createSelector(
    [getFeatureFlags],
    (flags) => flags?.enableMetricFormatOverrides ?? false,
);

/**
 * Returns the currency format override from workspace settings.
 * This is the format that CURRENCY metrics should inherit when no custom format is set.
 */
export const getCurrencyFormatOverride = createSelector(
    [getFeatureFlags],
    (flags) => flags?.currencyFormatOverride ?? null,
);

export const enableVisualizationFilteringByTags = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_VISUALIZATION_FILTERING_BY_TAGS] ?? false) as boolean,
);

const AVAILABLE_SELECTION_TYPES: AttributeFilterAvailableSelectionType[] = ["elements", "arbitrary", "match"];

export const getAvailableSelectionTypes = (): AttributeFilterAvailableSelectionType[] =>
    AVAILABLE_SELECTION_TYPES;

export const enableShellApplication = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_SHELL_APPLICATION] ?? true) as boolean,
);

export const enableEnhancedInsightPicker = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_ENHANCED_INSIGHT_PICKER] ?? false) as boolean,
);

export const enableGenAiRightPanel = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_GEN_AI_RIGHT_PANEL] ?? false) as boolean,
);

export const enableComputedAttributes = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_COMPUTED_ATTRIBUTES] ?? false) as boolean,
);

export const enableCollapsibleLeftSidebar = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.[FEATURE_FLAGS.ENABLE_COLLAPSIBLE_LEFT_SIDEBAR] ?? false) as boolean,
);

/**
 * Organization/workspace ENABLE_TIMEZONE_CHANGE setting — whether end users may change the timezone.
 */
export const isEnableTimezoneChange = createSelector(
    [getFeatureFlags],
    (flags) => (flags?.["enableTimezoneChange"] ?? false) as boolean,
);

/**
 * Workspace/organization timezone from settings — the default when no session override is set.
 */
export const getWorkspaceTimezone = createSelector(
    [getFeatureFlags],
    (flags) => flags?.timezone as string | undefined,
);
