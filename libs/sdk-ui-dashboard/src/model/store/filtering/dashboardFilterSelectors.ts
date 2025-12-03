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

import { selectCrossFilteringItems, selectCrossFilteringItemsByTab } from "../drill/drillSelectors.js";
import { ICrossFilteringItem } from "../drill/types.js";
import {
    selectAttributeFilterConfigsOverrides,
    selectAttributeFilterConfigsOverridesByTab,
} from "../tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectDateFilterConfigOverrides,
    selectDateFilterConfigOverridesByTab,
} from "../tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import {
    selectDateFilterConfigsOverrides,
    selectDateFilterConfigsOverridesByTab,
} from "../tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import {
    selectFilterContextFilters,
    selectFiltersByTab,
} from "../tabs/filterContext/filterContextSelectors.js";
import { selectTabs } from "../tabs/tabsSelectors.js";
import { DashboardSelector } from "../types.js";

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
    selectDateFilterConfigOverrides,
    selectDateFilterConfigsOverrides,
    selectAttributeFilterConfigsOverrides,
    (
        dashboardFiltersWithoutCrossFiltering,
        commonDateFilterConfig,
        dateFilterWithDimensionConfigs,
        attributeFilterConfigs,
    ) => {
        return dashboardFiltersWithoutCrossFiltering.filter((filter: FilterContextItem) =>
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
    selectDateFilterConfigOverrides,
    selectDateFilterConfigsOverrides,
    selectAttributeFilterConfigsOverrides,
    (
        dashboardFiltersWithoutCrossFiltering,
        commonDateFilterConfig,
        dateFilterWithDimensionConfigs,
        attributeFilterConfigs,
    ) => {
        return dashboardFiltersWithoutCrossFiltering.filter((filter: FilterContextItem) =>
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
        selectDateFilterConfigOverrides,
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
        const dashboardCommonDateFilter = availableDashboardFilters.find(isDashboardCommonDateFilter);
        return dashboardCommonDateFilter?.dateFilter.localIdentifier;
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

//
// Per-tab automation filter selectors
//

/**
 * Automation filters grouped by tab.
 * @alpha
 */
export interface IAutomationFiltersTab {
    /**
     * Tab local identifier.
     */
    tabId: string;
    /**
     * Tab title.
     */
    tabTitle: string;
    /**
     * Automation-available filters for the tab (hidden filters removed).
     */
    availableFilters: FilterContextItem[];
    /**
     * Default selected filters for the tab (non-locked empty attribute filters removed).
     */
    defaultSelectedFilters: FilterContextItem[];
    /**
     * Locked filters for the tab.
     */
    lockedFilters: FilterContextItem[];
    /**
     * Hidden filters for the tab.
     */
    hiddenFilters: FilterContextItem[];
}

/**
 * Returns automation-available filters structured per tab.
 * Each entry includes tab information and the filters applicable to that tab.
 * This selector is useful for whole dashboard automations when dashboard tabs are enabled.
 *
 * @alpha
 */
export const selectAutomationFiltersByTab: DashboardSelector<IAutomationFiltersTab[]> = createSelector(
    selectTabs,
    selectFiltersByTab,
    selectDateFilterConfigOverridesByTab,
    selectDateFilterConfigsOverridesByTab,
    selectAttributeFilterConfigsOverridesByTab,
    selectCrossFilteringItemsByTab,
    (
        tabs,
        filtersByTab,
        dateFilterConfigByTab,
        dateFilterConfigsByTab,
        attributeFilterConfigsByTab,
        crossFilteringItemsByTab,
    ) => {
        if (!tabs || tabs.length === 0) {
            return [];
        }

        return tabs.map((tab) => {
            const tabId = tab.localIdentifier;
            const tabTitle = tab.title ?? "";
            const rawFilters = filtersByTab[tabId] ?? [];

            // Get cross-filtering items for this specific tab
            const tabCrossFilteringItems = crossFilteringItemsByTab[tabId] ?? [];

            // Remove cross-filtering filters for this tab
            const filtersWithoutCrossFiltering = removeCrossFilteringFilters(
                rawFilters,
                tabCrossFilteringItems,
            );

            // Ensure common date filter exists
            const filtersWithCommonDate = filtersWithoutCrossFiltering.some(isDashboardCommonDateFilter)
                ? filtersWithoutCrossFiltering
                : [commonDateFilter, ...filtersWithoutCrossFiltering];

            // Get filter configs for this tab
            const commonDateFilterConfig = dateFilterConfigByTab[tabId];
            const dateFilterWithDimensionConfigs = dateFilterConfigsByTab[tabId] ?? [];
            const attributeFilterConfigs = attributeFilterConfigsByTab[tabId] ?? [];

            const filterConfigurations = {
                commonDateFilterConfig,
                dateFilterWithDimensionConfigs,
                attributeFilterConfigs,
            };

            // Get available filters (hidden removed)
            const availableFilters = removeHiddenFilters(filtersWithCommonDate, filterConfigurations);

            // Get locked filters
            const lockedFilters = filtersWithCommonDate.filter((filter) =>
                isFilterContextItemLocked(filter, filterConfigurations),
            );

            // Get hidden filters
            const hiddenFilters = filtersWithCommonDate.filter((filter) =>
                isFilterContextItemHidden(filter, filterConfigurations),
            );

            // Get default selected filters (non-locked empty attribute filters removed)
            const defaultSelectedFilters = removeNonLockedEmptyDashboardAttributeFilters(
                availableFilters,
                lockedFilters,
            );

            return {
                tabId,
                tabTitle,
                availableFilters,
                defaultSelectedFilters,
                lockedFilters,
                hiddenFilters,
            };
        });
    },
);
