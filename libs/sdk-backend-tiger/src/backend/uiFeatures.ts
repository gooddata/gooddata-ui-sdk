// (C) 2020-2023 GoodData Corporation

/**
 * This is list of feature flags managed on Panther by FeatureHub
 * and keeping their default values for non-managed env
 */

export enum TigerFeaturesNames {
    //boolean + possible values: enabled, disabled
    EnableSortingByTotalGroup = "enableSortingByTotalGroup",
    //string, possible values: disabled, enabledCheckedByDefault, enabledUncheckedByDefault
    ADMeasureValueFilterNullAsZeroOption = "ADMeasureValueFilterNullAsZeroOption",
    //boolean + possible values: enabled, disabled
    EnableMultipleDates = "enableMultipleDates",
    //boolean + possible values: enabled, disabled
    EnableKPIDashboardDeleteFilterButton = "enableKPIDashboardDeleteFilterButton",
    //boolean + possible values: enabled, disabled
    DashboardEditModeDevRollout = "dashboardEditModeDevRollout",
    //boolean + possible values: enabled, disabled
    EnableMetricSqlAndDataExplain = "enableMetricSqlAndDataExplain",
    //boolean + possible values: enabled, disabled
    EnableLongitudeAndLatitudeLabels = "enableLongitudeAndLatitudeLabels",
    //boolean + possible values: enabled, disabled
    EnableDescriptions = "enableDescriptions",
    //boolean + possible values: enabled, disabled
    EnableAnalyticalDashboardPermissions = "enableAnalyticalDashboardPermissions",
    //boolean + possible values: enabled, disabled
    EnablePushpinGeoChart = "enablePushpinGeoChart",
    //boolean + possible values: enabled, disabled
    EnableKPIAttributeFilterRenaming = "enableKPIAttributeFilterRenaming",
    //boolean + possible values: enabled, disabled
    EnableKPIDashboardExportPDF = "enableKPIDashboardExportPDF",
    //boolean + possible values: enabled, disabled
    EnableSqlDatasets = "enableSqlDatasets",
    //boolean + possible values: enabled, disabled
    EnableSingleSelectionFilter = "enableSingleSelectionFilter",
    //boolean + possible values: enabled, disabled
    EnableFunnelChart = "enableFunnelChart",
    //boolean + possible values: enabled, disabled
    EnablePyramidChart = "enablePyramidChart",
    //boolean + possible values: enabled, disabled
    EnableCompositeGrain = "enableCompositeGrain",
}

export type ITigerFeatureFlags = {
    enableSortingByTotalGroup: typeof FeatureFlagsValues["enableSortingByTotalGroup"][number];
    ADMeasureValueFilterNullAsZeroOption: typeof FeatureFlagsValues["ADMeasureValueFilterNullAsZeroOption"][number];
    enableMultipleDates: typeof FeatureFlagsValues["enableMultipleDates"][number];
    enableKPIDashboardDeleteFilterButton: typeof FeatureFlagsValues["enableKPIDashboardDeleteFilterButton"][number];
    dashboardEditModeDevRollout: typeof FeatureFlagsValues["dashboardEditModeDevRollout"][number];
    enableMetricSqlAndDataExplain: typeof FeatureFlagsValues["enableMetricSqlAndDataExplain"][number];
    enableLongitudeAndLatitudeLabels: typeof FeatureFlagsValues["enableLongitudeAndLatitudeLabels"][number];
    enableDescriptions: typeof FeatureFlagsValues["enableDescriptions"][number];
    enableAnalyticalDashboardPermissions: typeof FeatureFlagsValues["enableAnalyticalDashboardPermissions"][number];
    enablePushpinGeoChart: typeof FeatureFlagsValues["enablePushpinGeoChart"][number];
    enableKPIAttributeFilterRenaming: typeof FeatureFlagsValues["enableKPIAttributeFilterRenaming"][number];
    enableKPIDashboardExportPDF: typeof FeatureFlagsValues["enableKPIDashboardExportPDF"][number];
    enableSqlDatasets: typeof FeatureFlagsValues["enableSqlDatasets"][number];
    enableSingleSelectionFilter: typeof FeatureFlagsValues["enableSingleSelectionFilter"][number];
    enableFunnelChart: typeof FeatureFlagsValues["enableFunnelChart"][number];
    enablePyramidChart: typeof FeatureFlagsValues["enablePyramidChart"][number];
    enableCompositeGrain: typeof FeatureFlagsValues["enableCompositeGrain"][number];
};

export const DefaultFeatureFlags: ITigerFeatureFlags = {
    enableSortingByTotalGroup: false,
    ADMeasureValueFilterNullAsZeroOption: "EnabledUncheckedByDefault",
    enableMultipleDates: true,
    enableKPIDashboardDeleteFilterButton: false,
    dashboardEditModeDevRollout: true,
    enableMetricSqlAndDataExplain: false,
    enableLongitudeAndLatitudeLabels: true,
    enableDescriptions: true,
    enableAnalyticalDashboardPermissions: true,
    enablePushpinGeoChart: true,
    enableKPIAttributeFilterRenaming: false,
    enableKPIDashboardExportPDF: true,
    enableSqlDatasets: false,
    enableSingleSelectionFilter: true,
    enableFunnelChart: false,
    enablePyramidChart: false,
    enableCompositeGrain: false,
};

export const FeatureFlagsValues = {
    enableSortingByTotalGroup: [true, false] as const,
    ADMeasureValueFilterNullAsZeroOption: [
        "Disabled",
        "EnabledCheckedByDefault",
        "EnabledUncheckedByDefault",
    ] as const,
    enableMultipleDates: [true, false] as const,
    enableKPIDashboardDeleteFilterButton: [true, false] as const,
    dashboardEditModeDevRollout: [true, false] as const,
    enableMetricSqlAndDataExplain: [true, false] as const,
    enableLongitudeAndLatitudeLabels: [true, false] as const,
    enableDescriptions: [true, false] as const,
    enableAnalyticalDashboardPermissions: [true, false] as const,
    enablePushpinGeoChart: [true, false] as const,
    enableKPIAttributeFilterRenaming: [true, false] as const,
    enableKPIDashboardExportPDF: [true, false] as const,
    enableSqlDatasets: [true, false] as const,
    enableSingleSelectionFilter: [true, false] as const,
    enableFunnelChart: [true, false] as const,
    enablePyramidChart: [true, false] as const,
    enableCompositeGrain: [true, false] as const,
};
