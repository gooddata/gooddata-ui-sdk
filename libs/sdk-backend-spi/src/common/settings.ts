// (C) 2020 GoodData Corporation

/**
 *
 * This enum lists notable settings that should work across implementations of Analytical Backends.
 *
 * @public
 */
export enum SettingCatalog {
    /**
     * Headline component will not be underlined when it is set up with drilling.
     */
    disableKpiDashboardHeadlineUnderline = "disableKpiDashboardHeadlineUnderline",

    /**
     * Allows configuration of axis name position and visibility for Pluggable Visualizations.
     */
    enableAxisNameConfiguration = "enableAxisNameConfiguration",

    /**
     * Indicates whether PivotTable columns should be auto-resized to fit viewport before
     * the table is shown to the user.
     */
    enableTableColumnsAutoResizing = "enableTableColumnsAutoResizing",

    /**
     * Indicates whether PivotTable should grow to fill all available, allocated space.
     */
    enableTableColumnsGrowToFit = "enableTableColumnsGrowToFit",

    /**
     * Indicates whether PivotTable manual resizing should be persisted or not.
     */
    enableTableColumnsManualResizing = "enableTableColumnsManualResizing",

    /**
     * Indicates whether the Bullet Chart is available in AD.
     */
    enableBulletChart = "enableBulletChart",

    /**
     * Indicates whether the GeoPushpin Chart is available in AD.
     */
    enablePushpinGeoChart = "enablePushpinGeoChart",

    /**
     * Indicates whether week filtering is available in AD.
     */
    enableWeekFilters = "enableWeekFilters",

    /**
     * Indicates whether color picker config panel should allow users to select custom RGB colors.
     */
    enableCustomColorPicker = "enableCustomColorPicker",

    /**
     * Indicates whether "Treat null as zero" option should be displayed in measure value filter configuration and its default state"
     */
    ADMeasureValueFilterNullAsZeroOption = "ADMeasureValueFilterNullAsZeroOption",

    /**
     * Indicates whether data point visibility configuration is available in AD
     */
    enableHidingOfDataPoints = "enableHidingOfDataPoints",
}

/**
 * Settings are obtained from backend and are effectively a collection of feature flags or settings with
 * concrete string or numeric value. Settings are stored and configured on the server and typically allow
 * for a more fine-grained tuning of otherwise unified behavior.
 *
 * @public
 */
export interface ISettings {
    [key: string]: number | boolean | string;
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
