// (C) 2020-2021 GoodData Corporation
import { ISettings, IUserSettings } from "@gooddata/sdk-backend-spi";

/**
 * Tiger does not yet have endpoints for settings. All the UI-specific
 * settings are thus hardcoded here.
 */
export const DefaultUiSettings: ISettings = {
    activeFiltersByDefault: true,
    enableActiveFilterContext: true,
    cellMergedByDefault: true,
    enableMetricDateFilter: true,
    enableAnalyticalDesignerExport: true,
    enableComboChart: true,
    enableNewADFilterBar: true,
    enableMeasureValueFilters: true,
    // geochart must be disabled for now on tiger backend due to missing mapbox token infrastructure there (RAIL-3058)
    enablePushpinGeoChart: false,
    hidePixelPerfectExperience: true,
    enableBulletChart: true,
    enableCsvUploader: true,
    platformEdition: "enterprise",
    portalLogoPage: false,
    analyticalDesigner: true,
    enableWeekFilters: true,
    enableCustomMeasureFormatting: true,
    enableAnalyticalDashboards: true,
    enableHidingOfDataPoints: true,
    enableAdCatalogRefresh: true,
    enableAdRankingFilter: true,
    enableMultipleDates: true,
    enableDomainHomepage: true,
    enableKPIDashboardDependentFilters: false,
    enableKDWidgetCustomHeight: true,
    enableSectionHeaders: true,
    enableKPIDashboardSaveAsNew: true,
    enableEmbedButtonInKD: true,
    enableApproxCount: true,
    enableDataSampling: true,

    // pivot table specific
    enableTableColumnsManualResizing: true,
    enableTableColumnsAutoResizing: true,
    enableTableColumnsGrowToFit: true,

    // embedding AD in KD
    enableExploreInsightsFromKD: true,
    enableEditInsightsFromKD: true,
    enableKPIDashboardNewInsight: true,

    // drilling
    enableKPIDashboardDrillToDashboard: true,
    enableKPIDashboardDrillToInsight: true,
    enableKPIDashboardDrillToURL: true,

    enableNewNavigationForResponsiveUi: true,
    enableDataSection: true,
    ADMeasureValueFilterNullAsZeroOption: "EnabledCheckedByDefault",
    ADCatalogGroupsExpanded: true,
    enableCustomColorPicker: true,
    enableAdAdditionalDateAttributes: true,
};

/**
 * Locale for the applications.
 */
export const DefaultLocale: string = "en-US";

/**
 * Number separators.
 */
export const DefaultSeparators = {
    thousand: ",",
    decimal: ".",
};

/**
 * Default user settings. Make sure to override the 'userId' with the real id when using.
 */
export const DefaultUserSettings: IUserSettings = {
    userId: "template",
    locale: DefaultLocale,
    separators: DefaultSeparators,
    ...DefaultUiSettings,
};
