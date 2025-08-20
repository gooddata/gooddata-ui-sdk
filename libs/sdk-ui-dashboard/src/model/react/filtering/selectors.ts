// (C) 2024-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    FilterContextItem,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfig,
    IDashboardDateFilterConfigItem,
    areObjRefsEqual,
    dashboardFilterLocalIdentifier,
    isAllValuesDashboardAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilterWithDimension,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    DashboardSelector,
    ICrossFilteringItem,
    selectAttributeFilterConfigsOverrides,
    selectCrossFilteringItems,
    selectDateFilterConfigsOverrides,
    selectFilterContextFilters,
    selectPersistedDashboardFilterContextDateFilterConfig,
} from "../../store/index.js";

const commonDateFilter: FilterContextItem = newAllTimeDashboardDateFilter(
    undefined,
    generateDateFilterLocalIdentifier(0),
);

/**
 * @alpha
 */
export const selectDashboardFiltersWithoutCrossFiltering: DashboardSelector<FilterContextItem[]> =
    createSelector(
        selectFilterContextFilters,
        selectCrossFilteringItems,
        (dashboardFilters, crossFilteringItems) => {
            const dashboardFiltersWithCommonDateFilter = dashboardFilters.some(isDashboardCommonDateFilter)
                ? dashboardFilters
                : [commonDateFilter, ...dashboardFilters];

            return removeCrossFilteringFilters(dashboardFiltersWithCommonDateFilter, crossFilteringItems);
        },
    );

/**
 * @alpha
 */
export const selectDashboardHiddenFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectDashboardFiltersWithoutCrossFiltering,
    selectPersistedDashboardFilterContextDateFilterConfig,
    selectDateFilterConfigsOverrides,
    selectAttributeFilterConfigsOverrides,
    (
        dashboardFiltersWithoutCrossFiltering,
        commonDateFilterConfig,
        dateFilterWithDimensionConfigs,
        attributeFilterConfigs,
    ) => {
        return dashboardFiltersWithoutCrossFiltering.filter((filter) =>
            isFilterContextItemHidden(filter, {
                commonDateFilterConfig,
                dateFilterWithDimensionConfigs,
                attributeFilterConfigs,
            }),
        );
    },
);

/**
 * @alpha
 */
export const selectDashboardLockedFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectDashboardFiltersWithoutCrossFiltering,
    selectPersistedDashboardFilterContextDateFilterConfig,
    selectDateFilterConfigsOverrides,
    selectAttributeFilterConfigsOverrides,
    (
        dashboardFiltersWithoutCrossFiltering,
        commonDateFilterConfig,
        dateFilterWithDimensionConfigs,
        attributeFilterConfigs,
    ) => {
        return dashboardFiltersWithoutCrossFiltering.filter((filter) =>
            isFilterContextItemLocked(filter, {
                commonDateFilterConfig,
                dateFilterWithDimensionConfigs,
                attributeFilterConfigs,
            }),
        );
    },
);

/**
 * @alpha
 */
export const selectAutomationAvailableDashboardFilters: DashboardSelector<FilterContextItem[]> =
    createSelector(
        selectDashboardFiltersWithoutCrossFiltering,
        selectPersistedDashboardFilterContextDateFilterConfig,
        selectDateFilterConfigsOverrides,
        selectAttributeFilterConfigsOverrides,
        (
            dashboardFiltersWithoutCrossFiltering,
            commonDateFilterConfig,
            dateFilterWithDimensionConfigs,
            attributeFilterConfigs,
        ) => {
            const withCommonDateFilter = dashboardFiltersWithoutCrossFiltering.some(
                isDashboardCommonDateFilter,
            )
                ? dashboardFiltersWithoutCrossFiltering
                : [commonDateFilter, ...dashboardFiltersWithoutCrossFiltering];

            return removeHiddenFilters(withCommonDateFilter, {
                commonDateFilterConfig,
                dateFilterWithDimensionConfigs,
                attributeFilterConfigs,
            });
        },
    );

/**
 * @alpha
 */
export const selectAutomationDefaultSelectedFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectAutomationAvailableDashboardFilters,
    selectDashboardLockedFilters,
    (availableDashboardFilters, lockedFilters) => {
        return removeNonLockedEmptyDashboardAttributeFilters(availableDashboardFilters, lockedFilters);
    },
);

/**
 * @alpha
 */
export const selectAutomationCommonDateFilterId: DashboardSelector<string | undefined> = createSelector(
    selectAutomationAvailableDashboardFilters,
    (availableDashboardFilters) => {
        const commonDateFilter = availableDashboardFilters.find(isDashboardCommonDateFilter);
        return commonDateFilter?.dateFilter.localIdentifier;
    },
);

//
// Utils
//

const removeCrossFilteringFilters = (
    filters: FilterContextItem[],
    crossFilteringItems: ICrossFilteringItem[],
) => {
    const crossFilteringFilterLocalIdentifiers = crossFilteringItems.flatMap(
        (item) => item.filterLocalIdentifiers,
    );

    return filters.filter((filter) => {
        if (isDashboardAttributeFilter(filter) && filter.attributeFilter.localIdentifier) {
            return !crossFilteringFilterLocalIdentifiers.includes(filter.attributeFilter.localIdentifier);
        }

        return true;
    });
};

export function removeNonLockedEmptyDashboardAttributeFilters(
    filters: FilterContextItem[] = [],
    lockedFilters: FilterContextItem[] = [],
) {
    return filters.filter((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            const isLocked = lockedFilters.some(
                (lockedFilter) =>
                    dashboardFilterLocalIdentifier(lockedFilter) === filter.attributeFilter.localIdentifier,
            );
            if (isLocked) {
                return true;
            }
            const isAllFilter = isAllValuesDashboardAttributeFilter(filter);
            return !isAllFilter;
        }

        return true;
    });
}

function removeHiddenFilters(
    filters: FilterContextItem[],
    filterConfigurations: {
        commonDateFilterConfig?: IDashboardDateFilterConfig;
        dateFilterWithDimensionConfigs: IDashboardDateFilterConfigItem[];
        attributeFilterConfigs: IDashboardAttributeFilterConfig[];
    },
) {
    return filters.filter((filter) => {
        return !isFilterContextItemHidden(filter, filterConfigurations);
    });
}

// Relaxed typing of the common date filter/date filter with dimension guard,
// to avoid `never` type after checking common date filter and then working with date filters with dimension or the other way around.
type RelaxedDateFilterGuard = (filter: FilterContextItem) => boolean;

export const isFilterContextItemHidden = (
    filter: FilterContextItem,
    filterConfigurations: {
        commonDateFilterConfig?: IDashboardDateFilterConfig;
        dateFilterWithDimensionConfigs: IDashboardDateFilterConfigItem[];
        attributeFilterConfigs: IDashboardAttributeFilterConfig[];
    },
): boolean => {
    const { dateFilterWithDimensionConfigs, attributeFilterConfigs, commonDateFilterConfig } =
        filterConfigurations;

    if (isDashboardAttributeFilter(filter)) {
        const config = attributeFilterConfigs.find(
            (attribute) => attribute.localIdentifier === filter.attributeFilter.localIdentifier,
        );
        return config?.mode === "hidden";
    } else if ((isDashboardCommonDateFilter as RelaxedDateFilterGuard)(filter)) {
        return commonDateFilterConfig?.mode === "hidden";
    } else if ((isDashboardDateFilterWithDimension as RelaxedDateFilterGuard)(filter)) {
        const config = dateFilterWithDimensionConfigs.find((date) =>
            areObjRefsEqual(date.dateDataSet, filter.dateFilter.dataSet),
        );
        return config?.config.mode === "hidden";
    }

    return false;
};

export const isFilterContextItemLocked = (
    filter: FilterContextItem,
    filterConfigurations: {
        commonDateFilterConfig?: IDashboardDateFilterConfig;
        dateFilterWithDimensionConfigs: IDashboardDateFilterConfigItem[];
        attributeFilterConfigs: IDashboardAttributeFilterConfig[];
    },
): boolean => {
    const { dateFilterWithDimensionConfigs, attributeFilterConfigs, commonDateFilterConfig } =
        filterConfigurations;

    if (isDashboardAttributeFilter(filter)) {
        const config = attributeFilterConfigs.find(
            (attribute) => attribute.localIdentifier === filter.attributeFilter.localIdentifier,
        );
        return config?.mode === "readonly";
    } else if ((isDashboardCommonDateFilter as RelaxedDateFilterGuard)(filter)) {
        return commonDateFilterConfig?.mode === "readonly";
    } else if ((isDashboardDateFilterWithDimension as RelaxedDateFilterGuard)(filter)) {
        const config = dateFilterWithDimensionConfigs.find((date) =>
            areObjRefsEqual(date.dateDataSet, filter.dateFilter.dataSet),
        );
        return config?.config.mode === "readonly";
    }

    return false;
};
