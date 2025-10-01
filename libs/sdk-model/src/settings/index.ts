// (C) 2020-2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import { IDateFilterConfig } from "../dateFilterConfig/index.js";

/**
 * Settings are obtained from backend and are effectively a collection of feature flags or settings with
 * concrete string or numeric value.
 *
 * @remarks
 * Settings are stored and configured on the server and typically allow
 * for a more fine-grained tuning of otherwise unified behavior.
 *
 * @public
 */
export interface ISettings {
    //
    // Platform Settings
    //

    /**
     * Represents whiteLabeling configuration
     */
    whiteLabeling?: IWhiteLabeling;

    /**
     * Represents alert default configuration
     */
    alertDefault?: IAlertDefault;

    /**
     * Represents configuration for OpenAI integration
     * @alpha
     */
    openAiConfig?: IOpenAiConfig;

    /**
     * Represents configuration for Dashboard Filters Apply Mode
     * @alpha
     */
    dashboardFiltersApplyMode?: DashboardFiltersApplyMode;

    /**
     * Indicates current platform edition.
     */
    platformEdition?: PlatformEdition;

    /**
     * Early access features configuration.
     * @beta
     */
    earlyAccessFeatures?: IEarlyAccessFeaturesConfig;

    /**
     * Week start day
     */
    weekStart?: WeekStart;

    /**
     * Locale code to use for metadata.
     */
    metadataLocale?: string;

    /**
     * Locale code to use for date formatting.
     */
    formatLocale?: string;

    /**
     * Indicates the format in which the dates will be displayed
     */
    responsiveUiDateFormat?: string;

    /**
     * IANA identifier of time zone in which the platform metadata are stored.
     */
    metadataTimeZone?: string;

    /**
     * Timezone
     */
    timezone?: string;

    /**
     * Ai rate limit in requests per minute.
     */
    aiRateLimit?: number;

    /**
     * LLM endpoint id as default for the platform.
     */
    llmEndpoint?: ILlmEndpoint;

    /**
     * Attachment size limit in bytes (null for no limit).
     */
    attachmentSizeLimit?: number | null;

    /**
     * If true, non-TLS endpoints may be used for FlexConnect.
     * Otherwise, only TLS-enabled endpoints may be used.
     */
    allowUnsafeFlexConnectEndpoints?: boolean;

    /**
     * Enable automation evaluation mode.
     */
    enableAutomationEvaluationMode?: boolean;

    //
    // Feature Flags
    //

    /**
     * Enables Highcharts accessibility features.
     */
    enableHighchartsAccessibility?: boolean;

    /**
     * Enables accessible chart tooltips with improved readability and persistence for disabled users.
     */
    enableAccessibleChartTooltip?: boolean;

    /**
     * Enables additional chart accessibility features configurable in AD.
     */
    enableChartAccessibilityFeatures?: boolean;

    /**
     * Indicates whether the Waterfall Chart is available in AD.
     */
    enableWaterfallChart?: boolean;

    /**
     * Enable charts sorting customization
     */
    enableChartsSorting?: boolean;

    /**
     * Enable usage of insights, widgets, kpis descriptions.
     */
    enableDescriptions?: boolean;

    /**
     * Enable editing of insight description in AD.
     */
    enableAdDescriptionEdit?: boolean;

    /**
     * Enable use of composite grain
     */
    enableCompositeGrain?: boolean;

    /**
     * Enable new max bucket size items limit for Pivot Table
     */
    enablePivotTableIncreaseBucketSize?: boolean;

    /**
     * Enable user management page in Home UI.
     */
    enableUserManagement?: boolean;

    /**
     * Enable cross filtering in KD
     */
    enableKDCrossFiltering?: boolean;

    /**
     * Enable multiple date filters.
     */
    enableMultipleDateFilters?: boolean;

    /**
     * Enable multiple date filters in AD.
     */
    enableADMultipleDateFilters?: boolean;

    /**
     * Enables rich text widgets on dashboards.
     */
    enableKDRichText?: boolean;

    /**
     * Enables visualization switcher widgets on dashboards.
     */
    enableKDVisualizationSwitcher?: boolean;

    /**
     * Enable creating users in user management.
     */
    enableCreateUser?: boolean;

    /**
     * Enable attribute filter values validation by date filters.
     */
    enableKDAttributeFilterDatesValidation?: boolean;

    /**
     * Enable listing of the non-unique (duplicated) secondary label values in attribute filter.
     */
    enableDuplicatedLabelValuesInAttributeFilter?: boolean;

    /**
     * Enable multiple data sources to be used in a single workspace.
     */
    enableMultipleDataSourcesInWorkspace?: boolean;

    /**
     * Enables segmentation in scatter plot.
     */
    enableScatterPlotSegmentation?: boolean;

    /**
     * Enable clustering in scatter plot.
     */
    enableScatterPlotClustering?: boolean;

    /**
     * Enables rich text in descriptions.
     */
    enableRichTextDescriptions?: boolean;

    /**
     * Enables scheduling of the dashboard pdf export.
     */
    enableScheduling?: boolean;

    /**
     * Enables alerting of the dashboard widgets.
     */
    enableAlerting?: boolean;

    /**
     * Enables attributes in alerts.
     */
    enableAlertAttributes?: boolean;

    /**
     * Enables comparison in alerting.
     */
    enableComparisonInAlerting?: boolean;

    /**
     * Enables alerting rollout of the dashboard widgets.
     */
    enableAlertingRollout?: boolean;

    /**
     * Enables smtp settings.
     */
    enableSmtp?: boolean;

    /**
     * Enables storing widget identifiers.
     */
    enableWidgetIdentifiersRollout?: boolean;

    enableDataSection?: boolean;
    enableRenamingProjectToWorkspace?: boolean;
    enableAnalyticalDashboards?: boolean;
    hidePixelPerfectExperience?: boolean;
    enableNewNavigationForResponsiveUi?: boolean;
    enableMySqlDataSource?: boolean;
    enableMariaDbDataSource?: boolean;
    enableOracleDataSource?: boolean;
    enableSnowflakeKeyPairAuthentication?: boolean;
    enableMotherDuckDataSource?: boolean;
    enableSingleStoreDataSource?: boolean;

    /**
     * Enable GenAI-powered functionality, such as semantic-search.
     * @deprecated Use separate flags for semantic search and GenAI chat below.
     */
    enableAIFunctions?: boolean;

    /**
     * Enable Semantic Search in the UI.
     */
    enableSemanticSearch?: boolean;

    /**
     * Enable Semantic Search rollout in the UI.
     */
    enableSemanticSearchRollout?: boolean;

    /**
     * Enable Gen AI Chatbot in UI.
     */
    enableGenAIChat?: boolean;

    /**
     * Enable Gen AI Chatbot rollout in UI.
     */
    enableGenAIChatRollout?: boolean;

    /**
     * Enable multiple data sources to be used in a single workspace.
     */
    enableDashboardFilterViews?: boolean;

    /**
     * Enables ignore cross-filtering in widgets on dashboard.
     */
    enableIgnoreCrossFiltering?: boolean;

    /**
     * Enables manual headline exports on dashboard.
     */
    enableHeadlineExport?: boolean;

    /**
     * Enable the use of alias filter titles in cross filtering.
     * @internal
     */
    enableCrossFilteringAliasTitles?: boolean;

    /**
     * Enable the use of default SMTP in destinations.
     */
    enableDefaultSmtp?: boolean;

    /**
     * Enable number separators configuration in home-ui (both organization and workspace level).
     */
    enableNumberSeparators?: boolean;

    /**
     * Enable the use of new user creation flow.
     */
    enableNewUserCreationFlow?: boolean;

    /**
     * Enable the possibility to test destinations (emails, webhooks) in the UI.
     */
    enableDestinationTesting?: boolean;

    /**
     * Enable in-platform notifications.
     */
    enableInPlatformNotifications?: boolean;

    /**
     * Enable fine-tuning options for visualization in AD configuration panel.
     */
    enableVisualizationFineTuning?: boolean;

    /**
     * Enable external recipients options
     */
    enableExternalRecipients?: boolean;

    /**
     * Enable drilled tooltip in drill dialog
     */
    enableDrilledTooltip?: boolean;

    /**
     * Enable dashboard tabular export
     */
    enableDashboardTabularExport?: boolean;

    /**
     * Enable orchestrated tabular exports
     */
    enableOrchestratedTabularExports?: boolean;

    /**
     * Enable dynamic height of the dashboard section description fields in dashboard edit mode.
     */
    enableDashboardDescriptionDynamicHeight?: boolean;

    /**
     * Enables tracking events to Amplitude.
     */
    enableAmplitudeTracker?: boolean;

    /**
     * Enable slideshow exports using the new export render mode in KD.
     */
    enableSlideshowExports?: boolean;

    /**
     * Enable slideshow exports settings from server
     */
    enableSlidesExport?: boolean;

    /**
     * Enable rich text dynamic references.
     */
    enableRichTextDynamicReferences?: boolean;

    /**
     * Enable insights export of raw data when limit is reached.
     */
    enableRawExports?: boolean;

    /**
     * Enable new PDF tabular export option for insights.
     */
    enableNewPdfTabularExport?: boolean;

    /**
     * Enable config for a single global "Apply" button on the dashboard, replacing individual apply buttons next to each filter.
     */
    enableDashboardFiltersApplyModes?: boolean;

    /**
     * Date filter configuration.
     * @alpha
     */
    dateFilterConfig?: IDateFilterConfig;

    /**
     * Enable execution cancelling.
     */
    enableExecutionCancelling?: boolean;

    /**
     * Enable immediate attribute filter displayAsLabel migration information propagation right upon the load of the component.
     */
    enableImmediateAttributeFilterDisplayAsLabelMigration?: boolean;

    /**
     * Enable the URL sharing functionality in the dashboard share dialog.
     */
    enableDashboardShareLink?: boolean;

    /**
     * Enable using execution timestamp.
     */
    enableExecutionTimestamp?: boolean;

    /**
     * Enable automation filter context.
     */
    enableAutomationFilterContext?: boolean;

    /**
     * Enables storing date filter identifiers.
     */
    enableDateFilterIdentifiersRollout?: boolean;

    /**
     * Enable to setup alerts evaluation frequency in dashboard settings.
     */
    enableAlertsEvaluationFrequencySetup?: boolean;

    /**
     * Enable a configurable trend threshold in line chart visualization.
     */
    enableLineChartTrendThreshold?: boolean;

    /**
     * Enable to respect chart legend position in KD.
     */
    enableKDRespectLegendPosition?: boolean;

    /**
     * Enables workspace settings link in account menu of the user in every app header.
     */
    enableWorkspaceSettingsAppHeaderMenuItem?: boolean;

    /**
     * Enable accessibility enhancements for snapshot export.
     */
    enableSnapshotExportAccessibility?: boolean;

    /**
     * Enable widget export to PDF.
     */
    enableWidgetExportPdf?: boolean;

    /**
     * Enable widget export to PNG image.
     */
    enableWidgetExportPngImage?: boolean;

    /**
     * Enable export to document storage.
     */
    enableExportToDocumentStorage?: boolean;

    /**
     * Enable usage of new dropdown list replacing fixed-data-table
     */
    enableAttributeFilterVirtualised?: boolean;

    /**
     * Enable notification channel identifiers
     */
    enableNotificationChannelIdentifiers?: boolean;

    /**
     * Enable dashboard share dialog link
     */
    enableDashboardShareDialogLink?: boolean;

    /**
     * Enable production features
     *
     * @alpha
     */
    productionFeatures?: IProductionFeaturesConfig;

    /**
     * Enable new scheduled export
     */
    enableNewScheduledExport?: boolean;

    /**
     * Enable custom Identity Provider
     */
    enableSeamlessIdpSwitch?: boolean;

    /**
     * Enable pre-aggregation datasets support in LDM Modeler.
     */
    enablePreAggregationDatasets?: boolean;

    /**
     * Enable "to date" filters also known as "bounded" filters (e.g. YTD, QTD, MTD, WTD)
     */
    enableToDateFilters?: boolean;

    /**
     * Enable new pivot table
     */
    enableNewPivotTable?: boolean;

    /**
     * Enable automation management in dashboards
     */
    enableAutomationManagement?: boolean;

    /**
     * Enable filter accessibility features including redesigned date filter components.
     */
    enableFilterAccessibility?: boolean;

    /**
     * Enable GenAI memory feature
     */
    enableGenAIMemory?: boolean;

    /**
     * AI Chat search limit
     */
    aiChatSearchLimit?: number;

    [key: string]: number | boolean | string | object | undefined | null;
}

/**
 * Indicates current platform edition.
 *
 * @public
 */
export type PlatformEdition = "free" | "growth" | "enterprise";

/**
 * Settings for regional number formatting
 *
 * @public
 */
export interface ISeparators {
    /**
     * Thousand separator (e.g. " " or ",")
     */
    thousand: string;

    /**
     * Decimal separator (e.g. "," or ".")
     */
    decimal: string;
}

/**
 * Determines whether the given object is an instance of {@link ISeparators}.
 * @param obj - object to check
 *
 * @public
 */
export function isSeparators(obj: unknown): obj is ISeparators {
    return !isEmpty(obj) && !!(obj as ISeparators).decimal && !!(obj as ISeparators).thousand;
}

/**
 * @public
 */
export interface ILlmEndpoint {
    /**
     * Unique identifier of the LLM endpoint.
     */
    id: string;
    /**
     * Type of the LLM endpoint.
     */
    type: "llmEndpoint";
}

/**
 * Configuration of WhiteLabeling.
 *
 * @public
 */
export interface IWhiteLabeling {
    /**
     * (De)/Activate whiteLabeling
     */
    enabled: boolean;

    /**
     * Whitelabeling favicon url
     */
    faviconUrl?: string;

    /**
     * Company logo url
     */
    logoUrl?: string;

    /**
     * Whitelabeling of Apple touch icon url
     */
    appleTouchIconUrl?: string;
}

/**
 * Alert Default
 *
 * @public
 */
export interface IAlertDefault {
    /**
     * Default evaluation frequency
     */
    defaultCron: string;
    /**
     * Default timezone
     */
    defaultTimezone: string;
}

/**
 * Configuration of integration of OpenAI.
 *
 * @alpha
 */
export interface IOpenAiConfig {
    /**
     * OpenAI organization ID
     */
    org: string;

    /**
     * OpenAI API token
     */
    token: string;
}

/**
 * Values of Dashboard Filters Apply Mode setting. Used for organization and workspace.
 * INDIVIDUAL mean that each filter has its own apply button.
 * ALL_AT_ONCE mean that there is a single apply button for all dashboard filters.
 *
 * @public
 */
export type DashboardFiltersApplyMode = { mode: "INDIVIDUAL" } | { mode: "ALL_AT_ONCE" };

/**
 * Week start day
 *
 * @public
 */
export type WeekStart = "Sunday" | "Monday";

/**
 * @beta
 */
export type EarlyAccessFeatureContext = "WORKSPACE" | "ORGANIZATION";

/**
 * @beta
 */
export type EarlyAccessFeatureStatus = "EXPERIMENTAL" | "BETA";

/**
 * @beta
 */
export interface IEarlyAccessFeatureConfig {
    title: string;
    description: string;
    docs?: string;
    earlyAccess: string;
    context: EarlyAccessFeatureContext;
    status: EarlyAccessFeatureStatus;
}

/**
 * @beta
 */
export interface IEarlyAccessFeaturesConfig {
    features: IEarlyAccessFeatureConfig[];
}

/**
 * @alpha
 */
export interface IProductionFeatureConfig {
    title: string;
    description: string;
    docs?: string;
    earlyAccess: string;
    /**
     * Expect global rollout date in ISO-8601 calendar date format (YYYY-MM-DD)
     */
    globalRollout: string;
}

/**
 * @alpha
 */
export interface IProductionFeaturesConfig {
    features?: IProductionFeatureConfig[];
}
