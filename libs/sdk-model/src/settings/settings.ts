// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import type { IDateFilterConfig } from "../dateFilterConfig/index.js";

/**
 * Describes metric format override configuration.
 *
 * @alpha
 */
export interface IMetricFormatOverrideSetting {
    /**
     * Mapping of metric type to custom format string.
     * When undefined or null, backend defaults are used.
     */
    formats?: Record<string, string> | null;
}

/**
 * Scope of an export template referenced by the default export template setting.
 *
 * @remarks
 * The discriminator makes the scope of the referenced template explicit: `"workspaceExportTemplate"`
 * points to a workspace-level template, `"exportTemplate"` to an organization-level template.
 *
 * @beta
 */
export type ExportTemplateType = "workspaceExportTemplate" | "exportTemplate";

/**
 * Default export template setting.
 *
 * @remarks
 * Selects the export template applied to slide exports when none is explicitly requested.
 *
 * @beta
 */
export interface IDefaultExportTemplate {
    /**
     * Identifier of the export template to use as the default.
     *
     * @remarks
     * Matches the backend `DEFAULT_EXPORT_TEMPLATE` setting content field name (`id`).
     */
    id: string;

    /**
     * Scope of the referenced export template.
     */
    type: ExportTemplateType;
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
 * @public
 */
export interface ILlmActiveProvider {
    /**
     * Unique identifier of the LLM endpoint.
     */
    id: string;
    /**
     * Type of the LLM endpoint.
     */
    type: "llmProvider";

    /**
     * Name of the LLM provider.
     */
    defaultModelId: string;
}

/**
 * AI rate limit configuration. Caps how many AI chat messages a user can send
 * within a rolling time window.
 *
 * @public
 */
export interface IAiRateLimit {
    /**
     * Maximum number of AI interactions allowed within the time window. Must be a positive integer.
     */
    maxInteractions: number;

    /**
     * Length of the rolling time window in hours. Must be a positive integer.
     */
    timeWindowHours: number;
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
 * Fiscal year calendar configuration
 *
 * @public
 */
export interface IFiscalYear {
    /**
     * Month offset from January (0 = January, 1 = February, ..., -1 = December of previous year, etc.)
     */
    monthOffset: number;
    /**
     * Prefix for fiscal year labels (e.g. "FY")
     */
    yearPrefix?: string;
    /**
     * Prefix for fiscal quarter labels (e.g. "Q")
     */
    quarterPrefix?: string;
    /**
     * Prefix for fiscal month/period labels (e.g. "P")
     */
    monthPrefix?: string;
}

/**
 * Calendar type
 *
 * @public
 */
export type CalendarType = "STANDARD" | "FISCAL";

/**
 * Active calendars configuration
 *
 * @public
 */
export interface IActiveCalendars {
    /**
     * Which calendar type is the default
     */
    default: CalendarType;
    /**
     * Whether standard calendar is enabled
     */
    standard: boolean;
    /**
     * Whether fiscal calendar is enabled
     */
    fiscal: boolean;
}

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

/**
 * Setting properties are used to customize platform behavior for end users.
 * These are permanent setting options that are intended to remain, unlike feature-flag-based settings.
 *
 * On the Panther/Tiger platform, each setting is backed by a metadata object with a unique setting type
 * registered in the backend.
 *
 * @public
 */
export interface IPermanentSettings {
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
     * Default export template applied to slide exports when none is explicitly requested.
     * @beta
     */
    defaultExportTemplate?: IDefaultExportTemplate;

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
     * Fiscal year calendar configuration
     */
    fiscalYear?: IFiscalYear;

    /**
     * Active calendars configuration
     */
    activeCalendars?: IActiveCalendars;

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
     * AI rate limit configuration: max interactions per rolling time window.
     */
    aiRateLimit?: IAiRateLimit;

    /**
     * Metric format override configuration.
     * @alpha
     */
    metricFormatOverride?: IMetricFormatOverrideSetting;

    /**
     * Resolved currency format override from metricFormatOverride.formats["CURRENCY"].
     * This is a convenience property normalized during settings resolution.
     * @alpha
     */
    currencyFormatOverride?: string | null;

    /**
     * LLM endpoint id as default for the platform.
     */
    llmEndpoint?: ILlmEndpoint;

    /**
     * LLM provider id as default for the platform.
     */
    activeLlmProvider?: ILlmActiveProvider;

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

    /**
     * Maximum zoom level applied to geo visualizations.
     *
     * @remarks
     * Null or undefined means that zoom is unrestricted
     * and default chart settings will be applied.
     */
    maxZoomLevel?: number | null;

    /**
     * Override the default timeout for polling for the export results.
     */
    exportResultPollingTimeoutSeconds?: number;

    /**
     * Default delimiter to use for CSV exports when not overridden by request.
     */
    exportCsvCustomDelimiter?: string;

    /**
     * Headline component will not be underlined when it is set up with drilling.
     */
    disableKpiDashboardHeadlineUnderline?: boolean;

    /**
     * Indicates whether unavailable data items are visible in the settings API
     * only available on Tiger/Panther
     */
    showHiddenCatalogItems?: boolean;

    /**
     * Indicates whether the catalog groups in analytical designer are expanded by default.
     */
    ADCatalogGroupsExpanded?: boolean;

    /**
     * Date filter configuration.
     * @alpha
     */
    dateFilterConfig?: IDateFilterConfig;

    /**
     * Restrict access to Base UI applications.
     */
    restrictBaseUi?: boolean;
}

/**
 * Setting properties are used to gate features that are in development or in various stages of rollout.
 * Each property will be retired in a future version of the SDK once the feature has been rolled out to
 * all users and is considered stable enough that there is no longer a need to roll it back or disable
 * it easily.
 *
 * On the Panther platform, each setting is controlled by FeatureHub and is registered as a feature flag
 * in the backend so that it can be configured for GoodData.CN (Tiger).
 *
 * @public
 */
export interface IFeatureFlags {
    /**
     * Enables UI and API support for metric type selection and metric format overrides management.
     */
    enableMetricFormatOverrides?: boolean;

    /**
     * Enables column-level (object-level) permissions: the backend enforces per-object
     * access rules on attributes, facts and labels, and the UI for managing that access
     * (e.g. the catalog share dialog) becomes available.
     */
    enableColumnLevelPermissions?: boolean;

    /**
     * Enables Highcharts accessibility features.
     */
    enableHighchartsAccessibility?: boolean;

    /**
     * Enables accessible chart tooltips with improved readability and persistence for disabled users.
     */
    enableAccessibleChartTooltip?: boolean;

    /**
     * Indicates whether the Radar Chart is available in AD.
     */
    enableRadarChart?: boolean;

    /**
     * Indicates whether the Mekko Chart is available in AD.
     */
    enableMekkoChart?: boolean;

    /**
     * Indicates whether the Embed dashboard button is available in KPI dashboards.
     */
    enableEmbedButtonInKD?: boolean;

    /**
     * Indicates whether the Embed button/dialog is available in AD.
     */
    enableEmbedButtonInAD?: boolean;

    /**
     * Enable change analysis
     */
    enableChangeAnalysis?: boolean;

    /**
     * Enable multiple conditions in measure value filters (MVF).
     *
     * @remarks
     * Defaults to true when not provided by the backend.
     */
    enableMultipleMvfConditions?: boolean;

    /**
     * Enable ranking filter to be used together with measure value filters (MVF).
     *
     * @remarks
     * Defaults to false when not provided by the backend.
     */
    enableRankingWithMvf?: boolean;

    /**
     * Enable the "Limit to N results" (strict limit of rows) option in the ranking filter.
     *
     * @remarks
     * Defaults to false when not provided by the backend.
     */
    enableRankingStrictLimit?: boolean;

    /**
     * Enable picking the ranked metric for a ranking filter from the catalog (referenced by ObjRef),
     * in addition to metrics present in the insight buckets.
     *
     * @remarks
     * Defaults to false when not provided by the backend.
     */
    enableImprovedRankingFilter?: boolean;

    enableDataSection?: boolean;
    enableMySqlDataSource?: boolean;
    enableMariaDbDataSource?: boolean;
    enableOracleDataSource?: boolean;
    enableOidcAuth?: boolean;
    enableMotherDuckDataSource?: boolean;
    enableMongoDbDataSource?: boolean;
    enableStarrocksDataSource?: boolean;
    enableSingleStoreDataSource?: boolean;
    enableCrateDbDataSource?: boolean;

    /**
     * Enable Semantic Search in the UI.
     */
    enableSemanticSearch?: boolean;

    /**
     * Enable Catalog smart search results in the UI.
     */
    enableCatalogSmartSearchResults?: boolean;

    /**
     * Enable Gen AI Chatbot in UI.
     */
    enableGenAIChat?: boolean;

    /**
     * Enable GenAI catalog quality checker in Analytics Catalog.
     */
    enableGenAICatalogQualityChecker?: boolean;

    /**
     * Enable trending and recommended object tabs in Analytics Catalog.
     */
    enableCatalogTrendingObjects?: boolean;

    /**
     * Enable certification indicators in Analytics Catalog.
     */
    enableCertification?: boolean;

    /**
     * Allow sending aggregated data to LLM.
     */
    enableAiOnData?: boolean;

    /**
     * Enable system account filtering.
     */
    enableSystemAccountFiltering?: boolean;

    /**
     * Enable the use of default SMTP in destinations.
     */
    enableDefaultSmtp?: boolean;

    /**
     * Enable fine-tuning options for visualization in AD configuration panel.
     */
    enableVisualizationFineTuning?: boolean;

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
     * Enable slideshow exports settings from server
     */
    enableSlidesExport?: boolean;

    /**
     * Enable insights export of raw data when limit is reached.
     */
    enableRawExports?: boolean;

    /**
     * Enable customizable CSV delimiter in exports.
     */
    enableCustomizableCsvDelimiter?: boolean;

    /**
     * Enable export template selection for slide exports.
     * When enabled, the user can choose which export template to apply
     * when exporting dashboards or widgets as slides.
     */
    enableExportTemplateSelection?: boolean;

    /**
     * Enable rich text widget filter configuration.
     * Allows users to configure date and attribute filter settings for rich text widgets.
     * @alpha
     */
    enableRichTextWidgetFilterConfiguration?: boolean;

    /**
     * Enable dashboard-level date dataset configuration for section headers.
     * Allows users to select which date dataset to use for filtering metrics in section header rich text.
     * @alpha
     */
    enableDashboardSectionHeadersDateDataSet?: boolean;

    /**
     * When enabled, dashboards are stored using the V3 analytical-dashboard model — tabs-only,
     * no root-level layout / filter configs / parameters. This reduces payload size for large
     * dashboards but breaks readability for SDK versions that only know V2 root-level properties.
     * Opt-in for customers who do not consume dashboards via legacy SDK readers.
     * @alpha
     */
    enableAnalyticalDashboardVersion3?: boolean;

    /**
     * Enable execution cancelling.
     */
    enableExecutionCancelling?: boolean;

    /**
     * Enable immediate attribute filter displayAsLabel migration information propagation right upon the load of the component.
     */
    enableImmediateAttributeFilterDisplayAsLabelMigration?: boolean;

    /**
     * Enables workspace settings link in account menu of the user in every app header.
     */
    enableWorkspaceSettingsAppHeaderMenuItem?: boolean;

    /**
     * Enable accessibility enhancements for snapshot export.
     */
    enableSnapshotExportAccessibility?: boolean;

    /**
     * Enable emitting of the early loading export status signal in export mode,
     * before any dashboard data is loaded.
     */
    enableExportTimeoutFix?: boolean;

    /**
     * Enable widget export to PDF.
     */
    enableWidgetExportPdf?: boolean;

    /**
     * Enable export to document storage.
     */
    enableExportToDocumentStorage?: boolean;

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
     * Enable new pivot table
     */
    enableNewPivotTable?: boolean;

    /**
     * Enable conditional formatting for the pivot table
     */
    enableConditionalFormatting?: boolean;

    /**
     * Enable new geo pushpin chart
     */
    enableNewGeoPushpin?: boolean;

    /**
     * Enable geo area labels.
     */
    enableGeoArea?: boolean;

    /**
     * Enable HLL catalog filtering.
     * When true, attributes without sourceColumn are hidden from the catalog.
     */
    enableHLL?: boolean;

    /**
     * Enables geo accessibility enhancements introduced for map canvas, legend semantics,
     * live announcements, and alternate table view.
     */
    enableGeoChartA11yImprovements?: boolean;

    /**
     * Enables viewport configuration for geo charts (custom viewport + pan/zoom navigation controls).
     */
    enableGeoChartsViewportConfig?: boolean;

    /**
     * Enables analytical designer recommendation for geo charts when locations contain conflicting segment values.
     */
    enableGeoSegmentConflictRecommendation?: boolean;

    /**
     * Enable basemap selection in geo chart configuration.
     */
    enableGeoBasemapConfig?: boolean;

    /**
     * Enable Geo collections management UI.
     */
    enableCustomGeoCollection?: boolean;

    /**
     * Enable satellite/hybrid basemap option in geo chart configuration.
     */
    enableGeoSatelliteBasemapOption?: boolean;

    /**
     * Enable geo pushpin icon sprite sheet configuration UI.
     */
    enableGeoPushpinIcon?: boolean;

    /**
     * Enable GenAI memory feature
     */
    enableGenAIMemory?: boolean;

    /**
     * Enable organization-level AI memory inherited into workspaces
     */
    enableOrgLevelAIMemory?: boolean;

    /**
     * Enable AI Knowledge feature
     */
    enableAIKnowledge?: boolean;

    /**
     * Enable the admin toggle that controls whether organization/workspace data can be sent to LLMs.
     */
    enableAIDataSetting?: boolean;

    /**
     * Enable GenAI reasoning visibility.
     */
    enableGenAIReasoningVisibility?: boolean;

    /**
     * AI Chat search limit
     */
    aiChatSearchLimit?: number;

    /**
     * Enable snapshot export
     */
    enableSnapshotExport?: boolean;

    /**
     * Enable accessibility mode
     */
    enableAccessibilityMode?: boolean;

    /**
     * This setting enables drills into URL in pivot table charts by default on all available attributes.
     * Renders table cells as hyperlinks.
     */
    enableDrillToUrlByDefault?: boolean;

    /**
     * This setting allows executions that reach a row/column/cell limit to return the partial data that was
     * computed (along with limit-break metadata) instead of failing with an error.
     */
    enablePartialDataResults?: boolean;

    /**
     * Enable anomaly detection alert
     */
    enableAnomalyDetectionAlert?: boolean;

    /**
     * Enable anomaly detection in visualization
     */
    enableAnomalyDetectionVisualization?: boolean;

    /**
     * Enable custom tooltip configuration.
     * @alpha
     */
    enableCustomTooltip?: boolean;

    /**
     * Enable alert once per interval
     */
    enableAlertOncePerInterval?: boolean;

    /**
     * Enable fiscal calendars configuration.
     */
    enableFiscalCalendars?: boolean;

    /**
     * Enable dashboard filter groups.
     *
     * Filter group are items in a filter bar which groups regular attribute filters into a logical groups.
     * Groups are configured via dashboard metadata new tab property called filterGroupsConfig.
     */
    enableDashboardFilterGroups?: boolean;

    /**
     * Enable match filter in Analytical Designer.
     */
    enableMatchFilterAD?: boolean;

    /**
     * Enable arbitrary filter in Analytical Designer.
     */
    enableArbitraryFilterAD?: boolean;

    /**
     * Enable match filter in Dashboard app.
     */
    enableMatchFilterKD?: boolean;

    /**
     * Enable arbitrary filter in Dashboard app.
     */
    enableArbitraryFilterKD?: boolean;

    /**
     * Enable measure value (numeric) filter in Dashboard app.
     */
    enableMeasureValueFilterKD?: boolean;
    /**
     * Enable filtering of visualizations by tags provided via URL.
     */
    enableVisualizationFilteringByTags?: boolean;

    /**
     * Enable filter control in drilling configuration.
     */
    enableFilterControlInDrillingConfiguration?: boolean;

    /**
     * Enable shell application.
     */
    enableShellApplication?: boolean;

    /**
     * Per-app sub-flag under enableShellApplication. When true (and
     * enableShellApplication is also true), the catalog runs as a pluggable
     * app inside the host. When false, the legacy in-app catalog at
     * `/workspaces/{id}/catalog/*` is rendered instead.
     */
    enableShellApplication_catalog?: boolean;

    /**
     * Per-app sub-flag under enableShellApplication. When true (and
     * enableShellApplication is also true), KPI Dashboards runs as a pluggable
     * app inside the host. When false, the legacy standalone app at
     * `/dashboards/#/workspace/{id}/...` is rendered instead.
     */
    enableShellApplication_dashboards?: boolean;

    /**
     * Enable NULL-aware joins used for FULL OUTER JOIN conditions.
     */
    enableNullableJoins?: boolean;

    /**
     * Enable dashboard density setting.
     *
     * When enabled, users can switch between "comfortable" and "compact" information density
     * in dashboard view mode.
     */
    enableDashboardDensitySetting?: boolean;

    /**
     * Enable search for dashboards in the left navigation panel.
     *
     * When enabled, users can search the dashboards list (Cmd/Ctrl+F) and the input is
     * always visible once the workspace contains more than ten dashboards.
     */
    enableDashboardsSearch?: boolean;

    /**
     * Enable Analytical Catalog application.
     */
    enableAnalyticalCatalog?: boolean;

    /**
     * Enable AI Hub.
     */
    enableAiHub?: boolean;

    /**
     * Enable ad-hoc triggering of existing automations from the manage dialog.
     */
    enableAutomationTrigger?: boolean;

    /**
     * Enable User Data Filters UI.
     */
    enableUserDataFiltersUi?: boolean;

    /**
     * Enable ai agentic conversations.
     */
    enableAiAgenticConversations?: boolean;

    /**
     * Enable per-workspace opt-out from sharing data with the LLM. When this flag is on,
     * GenAI features that send data to the LLM (e.g. visualization summarization) require
     * the workspace setting `enableAiOnData` to be set to true.
     */
    enableGenAiAgenticDataShareOptOut?: boolean;

    /**
     * Enable parameters feature.
     */
    enableParameters?: boolean;

    /**
     * Enable inline as-code metric editing in the analytics catalog.
     * When off, creating or editing a metric from the catalog redirects to the standalone metric editor.
     */
    enableAnalyticalCatalogMetricEditor?: boolean;

    /**
     * Enable authoring of string (textual) what-if parameters.
     */
    enableStringParameters?: boolean;

    /**
     * Enable enhanced insight picker.
     */
    enableEnhancedInsightPicker?: boolean;

    /**
     * Enable ai agentic suggestions.
     */
    enableAiAgenticSuggestions?: boolean;

    /**
     * Enable ai agentic multi-conversations.
     */
    enableAiAgenticMultiConversations?: boolean;

    /**
     * Enable agent switching in AI Assistant.
     */
    enableGenAiAgentSwitching?: boolean;

    /**
     * Enable observability in AI Assistant.
     */
    enableGenAiObservability?: boolean;

    /**
     * Enable period-over-period comparison percentages in AI Assistant observability.
     */
    enableGenAiObservabilityPercentages?: boolean;

    /**
     * Enable Anthropic provider in LLM configuration.
     */
    enableAiLlmAnthropicProvider?: boolean;

    /**
     * Enables Metric Editor loading as a remote module in the host application.
     */
    enableShellApplication_metricEditor?: boolean;

    /**
     * Per-app sub-flag under enableShellApplication. When true (and
     * enableShellApplication is also true), Analytical Designer runs as a
     * pluggable app inside the host. When false, the legacy standalone AD
     * served at the /analyze hash route is rendered instead.
     */
    enableShellApplication_analyticalDesigner?: boolean;

    /**
     * Enables Resizable Dashboard sidebar in edit mode.
     */
    enableDashboardSidebarResize?: boolean;

    /**
     * Enables LDM Modeler loading as a remote module in the host application.
     */
    enableShellApplication_ldmModeler?: boolean;
}
