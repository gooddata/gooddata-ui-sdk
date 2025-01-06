// (C) 2020-2025 GoodData Corporation

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
     * Locale code to use for date formatting.
     */
    formatLocale?: string;

    /**
     * Indicates whether "Treat null as zero" option should be displayed in measure value filter configuration and its default state"
     */
    ADMeasureValueFilterNullAsZeroOption?: string;

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

    //
    // Feature Flags
    //

    /**
     * Indicates whether the Headline's improvements is available.
     */
    enableNewHeadline?: boolean;

    /**
     * Headline component will not be underlined when it is set up with drilling.
     */
    disableKpiDashboardHeadlineUnderline?: boolean;

    /**
     * Disables Kpi widget drills in embedded mode.
     */
    hideKpiDrillInEmbedded?: boolean;

    /**
     * Allows configuration of axis name position and visibility for Pluggable Visualizations.
     */
    enableAxisNameConfiguration?: boolean;

    /**
     * Indicates whether PivotTable columns should be auto-resized to fit viewport before
     * the table is shown to the user.
     */
    enableTableColumnsAutoResizing?: boolean;

    /**
     * Indicates whether PivotTable should grow to fill all available, allocated space.
     */
    enableTableColumnsGrowToFit?: boolean;

    /**
     * Indicates whether PivotTable manual resizing should be persisted or not.
     */
    enableTableColumnsManualResizing?: boolean;

    /**
     * Indicates whether the Bullet Chart is available in AD.
     */
    enableBulletChart?: boolean;

    /**
     * Indicates whether the GeoPushpin Chart is available in AD.
     */
    enablePushpinGeoChart?: boolean;

    /**
     * Indicates whether the Waterfall Chart is available in AD.
     */
    enableWaterfallChart?: boolean;

    /**
     * Indicates whether week filtering is available in AD.
     */
    enableWeekFilters?: boolean;

    /**
     * Indicates whether color picker config panel should allow users to select custom RGB colors.
     */
    enableCustomColorPicker?: boolean;

    /**
     * Indicates whether the catalog groups in analytical designer are expanded by default.
     */
    ADCatalogGroupsExpanded?: boolean;

    /**
     * Indicates whether data point visibility configuration is available in AD
     */
    enableHidingOfDataPoints?: boolean;

    /**
     * Indicates whether multiple dates can be put into buckets
     */
    enableMultipleDates?: boolean;

    /**
     * Indicates whether alternative display form can be selected for attribute and multiple instances
     * of the same attributes can be put into buckets
     */
    enableAlternativeDisplayFormSelection?: boolean;

    /**
     * Indicates whether unavailable data items are visible
     */
    enableUnavailableItemsVisible?: boolean;

    /**
     * Indicates whether unavailable data items are visible in the settings API
     * only available on Tiger/Panther
     */
    showHiddenCatalogItems?: boolean;

    /**
     * Indicates whether dashboard scheduled mails are enabled.
     */
    enableKPIDashboardSchedule?: boolean;

    /**
     * Indicates whether the user can select recipients of scheduled e-mails.
     * If not, scheduled mail can only be sent to a logged in user.
     */
    enableKPIDashboardScheduleRecipients?: boolean;

    /**
     * Indicates whether the new UI for scheduled widget exports is enabled.
     */
    enableInsightExportScheduling?: boolean;

    /**
     * Indicates whether the user can zoom on the insights in KPI dashboards that have this feature enabled.
     */
    enableKDZooming?: boolean;

    /**
     * Indicates whether the user can change widget height in KPI dashboards.
     */
    enableKDWidgetCustomHeight?: boolean;

    /**
     * Indicates whether the user can save and existing dashboard in KPI dashboards as new.
     */
    enableKPIDashboardSaveAsNew?: boolean;

    /**
     * Indicates whether the Embed dashboard button is available in KPI dashboards.
     */
    enableEmbedButtonInKD?: boolean;

    /**
     * Indicates whether the Embed button/dialog is available in AD.
     */
    enableEmbedButtonInAD?: boolean;

    /**
     * Indicates whether the approximate variant of count is available in AD.
     */
    enableApproxCount?: boolean;

    /**
     * Indicates whether the drill to dashboard is enabled.
     */
    enableKPIDashboardDrillToDashboard?: boolean;

    /**
     * Indicates whether the drill to insight is enabled.
     */
    enableKPIDashboardDrillToInsight?: boolean;

    /**
     * Indicates whether the drill to url is enabled.
     */
    enableKPIDashboardDrillToURL?: boolean;

    /**
     * Indicates whether the drilled insight can be exported.
     */
    enableDrilledInsightExport?: boolean;

    /**
     * Indicates whether backend supports data sampling.
     */
    enableDataSampling?: boolean;

    /**
     * Indicates whether the company logo should be visible in the embedded dashboard.
     */
    enableCompanyLogoInEmbeddedUI?: boolean;

    /**
     * Setting to use Report instead of Insight in AD&KD
     */
    enableInsightToReport?: boolean;

    /**
     * Enable implicit drillToAttributeURL
     */
    enableClickableAttributeURL?: boolean;

    /**
     * Enable implicit drill down
     */
    enableKPIDashboardImplicitDrillDown?: boolean;

    /**
     * Enable drill from attributes
     */
    enableKPIDashboardDrillFromAttribute?: boolean;

    /**
     * Enable usage of Dashboard permissions
     */
    enableAnalyticalDashboardPermissions?: boolean;

    /**
     * Enable renaming measure to metric
     */
    enableRenamingMeasureToMetric?: boolean;

    /**
     * Enable axis label formatting
     */
    enableAxisLabelFormat?: boolean;

    /**
     * Enable charts sorting customization
     */
    enableChartsSorting?: boolean;

    /**
     * Enable hiding of widget title
     */
    enableHidingOfWidgetTitle?: boolean;

    /**
     * Enable axis name for the column, bar and bullet charts with view by two attributes.
     */
    enableAxisNameViewByTwoAttributes?: boolean;

    /**
     * Enable reverse the order of stacked items in bar chart.
     */
    enableReversedStacking?: boolean;

    /**
     * Enable visibility control for total labels
     */
    enableSeparateTotalLabels?: boolean;

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
     * Enable table transposition (metrics in rows)
     */
    enablePivotTableTransposition?: boolean;

    /**
     * Enable moving column attribute headers to the left.
     */
    enableColumnHeadersPosition?: boolean;

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
     * Enable attribute filter values validation by metric, attribute, fact.
     * The configuration of filter values validation is merged with parent filters UI.
     */
    enableAttributeFilterValuesValidation?: boolean;

    /**
     * Enable creating users in user management.
     */
    enableCreateUser?: boolean;

    /**
     * Enable attribute filter values validation by date filters.
     */
    enableKDAttributeFilterDatesValidation?: boolean;

    /**
     * Enable upload of multiple CSVs to data source and multiple CSV data sources.
     */
    enableMultipleCSVs?: boolean;

    /**
     * Enable possibility to set non-existing value into attribute filter in AD and KD via postMessage.
     */
    enableInvalidValuesInAttributeFilter?: boolean;

    /**
     * Enable listing of the non-unique (duplicated) secondary label values in attribute filter.
     */
    enableDuplicatedLabelValuesInAttributeFilter?: boolean;

    /**
     * Enable workspaces hierarchy view in Home UI.
     */
    enableWorkspacesHierarchyView?: boolean;

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
    enableCsvUploader?: boolean;
    enableAnalyticalDashboards?: boolean;
    enablePixelPerfectExperience?: boolean;
    hidePixelPerfectExperience?: boolean;
    enableNewNavigationForResponsiveUi?: boolean;
    enableMySqlDataSource?: boolean;
    enableMariaDbDataSource?: boolean;
    enableOracleDataSource?: boolean;
    enableSnowflakeKeyPairAuthentication?: boolean;
    enableMotherDuckDataSource?: boolean;
    enableSingleStoreDataSource?: boolean;

    /**
     * Enables new dashboard layout renderer with nesting support.
     */
    enableDashboardFlexibleLayout?: boolean;

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
     * Enable configuration workspace hierarchy settings in Home UI.
     */
    enableWorkspaceHierarchySettings?: boolean;

    /**
     * Enables ignore cross-filtering in widgets on dashboard.
     */
    enableIgnoreCrossFiltering?: boolean;

    /**
     * Enables manual headline exports on dashboard.
     */
    enableHeadlineExport?: boolean;

    /**
     * Enable early access features rollout.
     */
    enableEarlyAccessFeaturesRollout?: boolean;

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

    [key: string]: number | boolean | string | object | undefined;
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
