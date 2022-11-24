// (C) 2020-2022 GoodData Corporation

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
    EnableTheming = "enableTheming",
    //boolean + possible values: enabled, disabled
    EnableMetricSqlAndDataExplain = "enableMetricSqlAndDataExplain",
    //boolean + possible values: enabled, disabled
    EnableDateFormats = "enableDateFormats",
    //boolean + possible values: enabled, disabled
    EnableLongitudeAndLatitudeLabels = "enableLongitudeAndLatitudeLabels",
    //boolean + possible values: enabled, disabled
    EnableMSSQLDataSource = "enableMSSQLDataSource",
    //boolean + possible values: enabled, disabled
    EnableDescriptions = "enableDescriptions",
}

export type ITigerFeatureFlags = {
    enableSortingByTotalGroup: typeof FeatureFlagsValues["enableSortingByTotalGroup"][number];
    ADMeasureValueFilterNullAsZeroOption: typeof FeatureFlagsValues["ADMeasureValueFilterNullAsZeroOption"][number];
    enableMultipleDates: typeof FeatureFlagsValues["enableMultipleDates"][number];
    enableKPIDashboardDeleteFilterButton: typeof FeatureFlagsValues["enableKPIDashboardDeleteFilterButton"][number];
    dashboardEditModeDevRollout: typeof FeatureFlagsValues["dashboardEditModeDevRollout"][number];
    enableTheming: typeof FeatureFlagsValues["enableTheming"][number];
    enableMetricSqlAndDataExplain: typeof FeatureFlagsValues["enableMetricSqlAndDataExplain"][number];
    enableDateFormats: typeof FeatureFlagsValues["enableDateFormats"][number];
    enableLongitudeAndLatitudeLabels: typeof FeatureFlagsValues["enableLongitudeAndLatitudeLabels"][number];
    enableMSSQLDataSource: typeof FeatureFlagsValues["enableMSSQLDataSource"][number];
    enableDescriptions: typeof FeatureFlagsValues["enableDescriptions"][number];
};

export const DefaultFeatureFlags: ITigerFeatureFlags = {
    enableSortingByTotalGroup: false,
    ADMeasureValueFilterNullAsZeroOption: "EnabledUncheckedByDefault",
    enableMultipleDates: true,
    enableKPIDashboardDeleteFilterButton: false,
    // disable edit mode in gdc-dashboards during development
    dashboardEditModeDevRollout: false,
    enableTheming: true,
    enableMetricSqlAndDataExplain: false,
    enableDateFormats: true,
    enableLongitudeAndLatitudeLabels: false,
    enableMSSQLDataSource: false,
    enableDescriptions: false,
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
    enableTheming: [true, false] as const,
    enableMetricSqlAndDataExplain: [true, false] as const,
    enableDateFormats: [true, false] as const,
    enableLongitudeAndLatitudeLabels: [true, false] as const,
    enableMSSQLDataSource: [true, false] as const,
    enableDescriptions: [true, false] as const,
};
