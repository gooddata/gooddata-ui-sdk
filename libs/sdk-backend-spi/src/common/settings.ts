// (C) 2020-2021 GoodData Corporation

/**
 * Settings are obtained from backend and are effectively a collection of feature flags or settings with
 * concrete string or numeric value. Settings are stored and configured on the server and typically allow
 * for a more fine-grained tuning of otherwise unified behavior.
 *
 * @public
 */
export interface ISettings {
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
     * Indicates whether dashboard scheduled mails are enabled.
     */
    enableKPIDashboardSchedule?: boolean;

    /**
     * Indicates whether the user can select recipients of scheduled e-mails.
     * If not, scheduled mail can only be sent to a logged in user.
     */
    enableKPIDashboardScheduleRecipients?: boolean;

    /**
     * Indicates whether the user can zoom on the insights in KPI dashboards that have this feature enabled.
     */
    enableKDZooming?: boolean;

    /**
     * Indicates, whether dashboard "section headers" are enabled
     */
    enableSectionHeaders?: boolean;

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
     * Enable usage of Dashboard permissions
     */
    enableAnalyticalDashboardPermissions?: boolean;

    [key: string]: number | boolean | string | object | undefined;

    /**
     * Enable renaming measure to metric
     */
    enableRenamingMeasureToMetric?: boolean;
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
 * Settings for particular user.
 *
 * @public
 */
export interface IUserSettings extends ISettings {
    /**
     * User to which the settings belong.
     */
    userId: string;

    /**
     * User locale
     */
    locale: string;

    /**
     * Regional number formatting
     */
    separators: ISeparators;
}

/**
 * Settings for particular workspace.
 *
 * @public
 */
export interface IWorkspaceSettings extends ISettings {
    /**
     * Workspace to which the settings belong.
     */
    workspace: string;
}

/**
 * Settings for particular combination of user and workspace.
 *
 * @public
 */
export interface IUserWorkspaceSettings extends IUserSettings, IWorkspaceSettings {}
