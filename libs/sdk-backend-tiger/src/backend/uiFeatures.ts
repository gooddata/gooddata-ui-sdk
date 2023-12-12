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
    // Remove this FF only after 8.12.0 end of life. The following selector is missing parentheses and is not correctly set to true when FF is missing (read more in ticket RAIL-4970)
    // https://github.com/gooddata/gooddata-ui-sdk/commit/cd47ff9115fc944be721dfda9d58ede00c7c15e9#diff-d047b642946d563ff25cca09624eede9a605d2b8809bac26531324507de4e546R313
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
    EnableKPIDashboardExportPDF = "enableKPIDashboardExportPDF",
    //boolean + possible values: enabled, disabled
    EnableSqlDatasets = "enableSqlDatasets",
    //boolean + possible values: enabled, disabled
    EnableFunnelChart = "enableFunnelChart",
    //boolean + possible values: enabled, disabled
    EnablePyramidChart = "enablePyramidChart",
    //boolean + possible values: enabled, disabled
    EnableSankeyChart = "enableSankeyChart",
    //boolean + possible values: enabled, disabled
    EnableDependencyWheelChart = "enableDependencyWheelChart",
    //boolean + possible values: enabled, disabled
    EnableWaterfallChart = "enableWaterfallChart",
    //boolean + possible values: enabled, disabled
    EnableCompositeGrain = "enableCompositeGrain",
    //boolean + possible values: enabled, disabled
    EnableTableTotalRows = "enableTableTotalRows",
    //boolean + possible values: enabled, disabled
    EnablePdmRemovalDeprecationPhase = "enablePdmRemovalDeprecationPhase",
    EnableNewHeadline = "enableNewHeadline",
    //boolean + possible values: enabled, disabled
    EnableAttributeHierarchies = "enableAttributeHierarchies",
    //boolean + possible values: enabled, disabled
    EnableUnavailableItemsVisible = "enableUnavailableItemsVisible",
    //boolean + possible values: enabled, disabled
    EnablePivotTableIncreaseBucketSize = "enablePivotTableIncreaseBucketSize",
    // boolean + possible values: enabled, disabled
    EnableUserManagement = "enableUserManagement",
    //boolean + possible values: enabled, disabled
    EnableKDDependentFilters = "enableKDDependentFilters",
    //boolean + possible values: enabled, disabled
    EnableKDSavedFilters = "enableKDSavedFilters",
    //boolean + possible values: enabled, disabled
    EnableClickHouseDataSource = "enableClickHouseDataSource",
    //boolean + possible values: enabled, disabled
    EnableCsvAnalytics = "enableCsvAnalytics",
    //boolean + possible values: enabled, disabled
    EnableKDCrossFiltering = "enableKDCrossFiltering",
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
    enableKPIDashboardExportPDF: typeof FeatureFlagsValues["enableKPIDashboardExportPDF"][number];
    enableSqlDatasets: typeof FeatureFlagsValues["enableSqlDatasets"][number];
    enableFunnelChart: typeof FeatureFlagsValues["enableFunnelChart"][number];
    enablePyramidChart: typeof FeatureFlagsValues["enablePyramidChart"][number];
    enableSankeyChart: typeof FeatureFlagsValues["enableSankeyChart"][number];
    enableDependencyWheelChart: typeof FeatureFlagsValues["enableDependencyWheelChart"][number];
    enableWaterfallChart: typeof FeatureFlagsValues["enableWaterfallChart"][number];
    enableCompositeGrain: typeof FeatureFlagsValues["enableCompositeGrain"][number];
    enableTableTotalRows: typeof FeatureFlagsValues["enableTableTotalRows"][number];
    enablePdmRemovalDeprecationPhase: typeof FeatureFlagsValues["enablePdmRemovalDeprecationPhase"][number];
    enableNewHeadline: typeof FeatureFlagsValues["enableNewHeadline"][number];
    enableAttributeHierarchies: typeof FeatureFlagsValues["enableAttributeHierarchies"][number];
    enableUnavailableItemsVisible: typeof FeatureFlagsValues["enableUnavailableItemsVisible"][number];
    enablePivotTableIncreaseBucketSize: typeof FeatureFlagsValues["enablePivotTableIncreaseBucketSize"][number];
    enableUserManagement: typeof FeatureFlagsValues["enableUserManagement"][number];
    enableKDDependentFilters: typeof FeatureFlagsValues["enableKDDependentFilters"][number];
    enableKDSavedFilters: typeof FeatureFlagsValues["enableKDSavedFilters"][number];
    enableClickHouseDataSource: typeof FeatureFlagsValues["enableClickHouseDataSource"][number];
    enableCsvAnalytics: typeof FeatureFlagsValues["enableCsvAnalytics"][number];
    enableKDCrossFiltering: typeof FeatureFlagsValues["enableKDCrossFiltering"][number];
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
    enableKPIDashboardExportPDF: true,
    enableSqlDatasets: false,
    enableFunnelChart: true,
    enablePyramidChart: true,
    enableSankeyChart: true,
    enableDependencyWheelChart: true,
    enableWaterfallChart: true,
    enableCompositeGrain: false,
    enableTableTotalRows: true,
    enablePdmRemovalDeprecationPhase: false,
    enableNewHeadline: true,
    enableAttributeHierarchies: true,
    enableUnavailableItemsVisible: false,
    enablePivotTableIncreaseBucketSize: true,
    enableUserManagement: false,
    enableKDDependentFilters: false,
    enableKDSavedFilters: false,
    enableClickHouseDataSource: false,
    enableCsvAnalytics: false,
    enableKDCrossFiltering: false,
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
    enableKPIDashboardExportPDF: [true, false] as const,
    enableSqlDatasets: [true, false] as const,
    enableFunnelChart: [true, false] as const,
    enablePyramidChart: [true, false] as const,
    enableSankeyChart: [true, false] as const,
    enableDependencyWheelChart: [true, false] as const,
    enableWaterfallChart: [true, false] as const,
    enableCompositeGrain: [true, false] as const,
    enableTableTotalRows: [true, false] as const,
    enablePdmRemovalDeprecationPhase: [true, false] as const,
    enableNewHeadline: [true, false] as const,
    enableAttributeHierarchies: [true, false] as const,
    enableUnavailableItemsVisible: [true, false] as const,
    enablePivotTableIncreaseBucketSize: [true, false] as const,
    enableUserManagement: [true, false] as const,
    enableKDDependentFilters: [true, false] as const,
    enableKDSavedFilters: [true, false] as const,
    enableClickHouseDataSource: [true, false] as const,
    enableCsvAnalytics: [true, false] as const,
    enableKDCrossFiltering: [true, false] as const,
};
