// (C) 2020-2022 GoodData Corporation

export enum TigerFeaturesNames {
    EnableSortingByTotalGroup = "enableSortingByTotalGroup",
    ADmeasureValueFilterNullAsZeroOption = "ADmeasureValueFilterNullAsZeroOption",
    EnableMultipleDates = "enableMultipleDates",
    EnableKPIDashboardDeleteFilterButton = "enableKPIDashboardDeleteFilterButton",
    DashboardEditModeDevRollout = "dashboardEditModeDevRollout",
}

export type ITigerFeatureFlags = {
    enableSortingByTotalGroup: boolean;
    ADmeasureValueFilterNullAsZeroOption: boolean;
    enableMultipleDates: boolean;
    enableKPIDashboardDeleteFilterButton: boolean;
    dashboardEditModeDevRollout: boolean;
};

export const DefaultFeatureFlags: ITigerFeatureFlags = {
    enableSortingByTotalGroup: false,
    ADmeasureValueFilterNullAsZeroOption: false,
    enableMultipleDates: true,
    enableKPIDashboardDeleteFilterButton: false,
    // disable edit mode in gdc-dashboards during development
    dashboardEditModeDevRollout: false,
};
