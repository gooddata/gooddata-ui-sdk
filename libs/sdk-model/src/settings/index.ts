// (C) 2020-2023 GoodData Corporation

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
     * Indicates whether "Treat null as zero" option should be displayed in measure value filter configuration and its default state"
     */
    ADMeasureValueFilterNullAsZeroOption?: string;

    /**
     * Indicates whether the catalog groups in analytical designer are expanded by default.
     */
    ADCatalogGroupsExpanded?: boolean;

    /**
     * Indicates whether data point visibility configuration is available in AD
     */
    enableHidingOfDataPoints?: boolean;

    /**
     * Indicates the format in which the dates will be displayed
     */
    responsiveUiDateFormat?: string;

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
     * Indicates current platform edition.
     */
    platformEdition?: PlatformEdition;

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
     * Represents whiteLabeling configuration
     */
    whiteLabeling?: IWhiteLabeling;

    /**
     * Enable custom non-production dataset in AD/Modeler
     */
    ["msf.enableTenantCustomModel"]?: boolean;

    /**
     * Enable usage of insights, widgets, kpis descriptions.
     */
    enableDescriptions?: boolean;

    /**
     * Enable editing of insight description in AD.
     */
    enableAdDescriptionEdit?: boolean;

    /**
     * Locale code to use for date formatting.
     */
    formatLocale?: string;

    /**
     * Enable use of composite grain
     */
    enableCompositeGrain?: boolean;

    /**
     * Week start day
     */
    weekStart?: WeekStart;

    /**
     * Enable table transposition (metrics in rows)
     */
    enablePivotTableTransposition?: boolean;

    /**
     * Enable moving column attribute headers to the left.
     */
    enableColumnHeadersPosition?: boolean;

    /**
     * IANA identifier of time zone in which the platform metadata are stored.
     */
    metadataTimeZone?: string;

    /**
     * Enable attribute hierarchies.
     */
    enableAttributeHierarchies?: boolean;

    /**
     * Enable new max bucket size items limit for Pivot Table
     */
    enablePivotTableIncreaseBucketSize?: boolean;

    /**
     * Enable user management page in Home UI.
     */
    enableUserManagement?: boolean;

    /**
     * Enable new dependent filters in KD
     */
    enableKDDependentFilters?: boolean;

    /**
     * Enable cross filtering in KD
     */
    enableKDCrossFiltering?: boolean;

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
 * Week start day
 *
 * @public
 */
export type WeekStart = "Sunday" | "Monday";
