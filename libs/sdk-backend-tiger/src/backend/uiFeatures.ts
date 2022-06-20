// (C) 2020-2022 GoodData Corporation

export enum TigerFeaturesNames {
    //boolean + possible values: enabled, disabled
    EnableSortingByTotalGroup = "enableSortingByTotalGroup",
    //string, possible values: disabled, enabledCheckedByDefault, enabledUncheckedByDefault
    ADmeasureValueFilterNullAsZeroOption = "ADmeasureValueFilterNullAsZeroOption",
    //boolean + possible values: enabled, disabled
    EnableMultipleDates = "enableMultipleDates",
    //boolean + possible values: enabled, disabled
    EnableKPIDashboardDeleteFilterButton = "enableKPIDashboardDeleteFilterButton",
    //boolean + possible values: enabled, disabled
    DashboardEditModeDevRollout = "dashboardEditModeDevRollout",
}

export type ITigerFeatureFlags = {
    enableSortingByTotalGroup: typeof FeatureFlagsValues["enableSortingByTotalGroup"][number];
    ADmeasureValueFilterNullAsZeroOption: typeof FeatureFlagsValues["ADmeasureValueFilterNullAsZeroOption"][number];
    enableMultipleDates: typeof FeatureFlagsValues["enableMultipleDates"][number];
    enableKPIDashboardDeleteFilterButton: typeof FeatureFlagsValues["enableKPIDashboardDeleteFilterButton"][number];
    dashboardEditModeDevRollout: typeof FeatureFlagsValues["dashboardEditModeDevRollout"][number];
};

export const DefaultFeatureFlags: ITigerFeatureFlags = {
    enableSortingByTotalGroup: false,
    ADmeasureValueFilterNullAsZeroOption: "EnabledUncheckedByDefault",
    enableMultipleDates: true,
    enableKPIDashboardDeleteFilterButton: false,
    // disable edit mode in gdc-dashboards during development
    dashboardEditModeDevRollout: false,
};

export const FeatureFlagsValues = {
    enableSortingByTotalGroup: [true, false] as const,
    ADmeasureValueFilterNullAsZeroOption: [
        "Disabled",
        "EnabledCheckedByDefault",
        "EnabledUncheckedByDefault",
    ] as const,
    enableMultipleDates: [true, false] as const,
    enableKPIDashboardDeleteFilterButton: [true, false] as const,
    dashboardEditModeDevRollout: [true, false] as const,
};
