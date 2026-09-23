// (C) 2024-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import type { IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfig,
    type IDashboardDateFilterConfigItem,
    areObjRefsEqual,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    isAllDashboardMeasureValueFilter,
    isAllValuesDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardDateFilterWithDimension,
    isDashboardMeasureValueFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { createMemoizedSelector } from "../_infra/selectors.js";
import { selectCrossFilteringItems, selectCrossFilteringItemsByTab } from "../drill/drillSelectors.js";
import { type ICrossFilteringItem } from "../drill/types.js";
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
import { selectMeasureValueFilterConfigsOverrides } from "../tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";
import { selectTabs } from "../tabs/tabsSelectors.js";
import { type DashboardSelector } from "../types.js";
import { selectUnavailableObjects } from "../unavailableObjects/unavailableObjectsSelectors.js";

import { isDashboardFilterRestricted } from "./restrictedFilterUtils.js";
import { type IAutomationFiltersTab } from "./types.js";

const commonDateFilter: FilterContextItem = newAllTimeDashboardDateFilter(
    undefined,
    generateDateFilterLocalIdentifier(0),
);

export function filterLocalIdentifiers(filters: FilterContextItem[]): ReadonlySet<string> {
    return new Set(
        filters
            .map(dashboardFilterLocalIdentifier)
            .filter((localIdentifier): localIdentifier is string => localIdentifier !== undefined),
    );
}

const selectRestrictedDashboardFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectFilterContextFilters,
    selectUnavailableObjects,
    (filters, unavailableObjects) =>
        filters.filter((filter) => isDashboardFilterRestricted(filter, unavailableObjects)),
);

/**
 * Selects local identifiers of filters the current user is forbidden to access.
 *
 * @alpha
 */
export const selectRestrictedDashboardFilterLocalIdentifiers: DashboardSelector<ReadonlySet<string>> =
    createSelector(selectRestrictedDashboardFilters, filterLocalIdentifiers);

/**
 * Selects the filters the current user is forbidden to access that the filter bar reports: the ones
 * the author hid are left out, so they stay in the filter context and out of every execution.
 */
export const selectReportedRestrictedDashboardFilters: DashboardSelector<FilterContextItem[]> =
    createSelector(
        selectRestrictedDashboardFilters,
        selectDateFilterConfigOverrides,
        selectDateFilterConfigsOverrides,
        selectAttributeFilterConfigsOverrides,
        selectMeasureValueFilterConfigsOverrides,
        (
            restricted,
            commonDateFilterConfig,
            dateFilterWithDimensionConfigs,
            attributeFilterConfigs,
            measureValueFilterConfigs,
        ) =>
            restricted.filter((filter) =>
                // isFilterContextItemHidden covers attribute and date filters only
                isDashboardMeasureValueFilter(filter)
                    ? measureValueFilterConfigs.find(
                          (config) => config.localIdentifier === dashboardFilterLocalIdentifier(filter),
                      )?.mode !== "hidden"
                    : !isFilterContextItemHidden(filter, {
                          commonDateFilterConfig,
                          dateFilterWithDimensionConfigs,
                          attributeFilterConfigs,
                      }),
            ),
    );

/**
 * Selects how many filters the current user is forbidden to access, excluding those the author hid.
 *
 * @alpha
 */
export const selectRestrictedDashboardFilterCount: DashboardSelector<number> = createSelector(
    selectReportedRestrictedDashboardFilters,
    (reported) => reported.length,
);

/**
 * Selects dashboard filters that are safe to use in executions and filter-dependent requests.
 *
 * @alpha
 */
export const selectExecutableDashboardFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectFilterContextFilters,
    selectUnavailableObjects,
    (filters, unavailableObjects) =>
        filters.filter((filter) => !isDashboardFilterRestricted(filter, unavailableObjects)),
);

const selectRestrictedDashboardFiltersByTab: DashboardSelector<Record<string, FilterContextItem[]>> =
    createSelector(selectFiltersByTab, selectUnavailableObjects, (filtersByTab, unavailableObjects) =>
        Object.fromEntries(
            Object.entries(filtersByTab).map(([tabId, filters]) => [
                tabId,
                filters.filter((filter) => isDashboardFilterRestricted(filter, unavailableObjects)),
            ]),
        ),
    );

/**
 * Whether any filter was left out of the executable ones, on any tab. Callers that let the backend
 * fall back to the stored filter context must send the filters explicitly in that case.
 */
export const selectHasRestrictedDashboardFilters: DashboardSelector<boolean> = createSelector(
    selectRestrictedDashboardFilters,
    selectRestrictedDashboardFiltersByTab,
    (activeTab, byTab) => activeTab.length > 0 || Object.values(byTab).some((filters) => filters.length > 0),
);

/**
 * Selects local identifiers of filters the current user is forbidden to access on the given tab.
 * @alpha
 */
export const selectRestrictedDashboardFilterLocalIdentifiersForTab: (
    tabLocalIdentifier: string,
) => DashboardSelector<ReadonlySet<string>> = createMemoizedSelector((tabLocalIdentifier: string) =>
    createSelector(selectRestrictedDashboardFiltersByTab, (filtersByTab) =>
        filterLocalIdentifiers(filtersByTab[tabLocalIdentifier] ?? []),
    ),
);

/**
 * Selects execution-safe dashboard filters for every tab.
 *
 * @alpha
 */
export const selectExecutableDashboardFiltersByTab: DashboardSelector<Record<string, FilterContextItem[]>> =
    createSelector(selectFiltersByTab, selectUnavailableObjects, (filtersByTab, unavailableObjects) =>
        Object.fromEntries(
            Object.entries(filtersByTab).map(([tabId, filters]) => [
                tabId,
                filters.filter((filter) => !isDashboardFilterRestricted(filter, unavailableObjects)),
            ]),
        ),
    );

function withCommonDateFilterAndWithoutCrossFiltering(
    dashboardFilters: FilterContextItem[],
    crossFilteringItems: ICrossFilteringItem[],
): FilterContextItem[] {
    const dashboardFiltersWithCommonDateFilter = dashboardFilters.some(isDashboardCommonDateFilter)
        ? dashboardFilters
        : [commonDateFilter, ...dashboardFilters];

    return removeCrossFilteringFilters(dashboardFiltersWithCommonDateFilter, crossFilteringItems);
}

/**
 * Dashboard filters safe to execute with: the ones the current user may not read are left out.
 *
 * @alpha
 */
export const selectExecutableDashboardFiltersWithoutCrossFiltering: DashboardSelector<FilterContextItem[]> =
    createSelector(
        selectExecutableDashboardFilters,
        selectCrossFilteringItems,
        withCommonDateFilterAndWithoutCrossFiltering,
    );

/**
 * Same as {@link selectExecutableDashboardFiltersWithoutCrossFiltering}, but keeping the filters the
 * current user may not read, which an automation stores like any other.
 */
export const selectAllDashboardFiltersWithoutCrossFiltering: DashboardSelector<FilterContextItem[]> =
    createSelector(
        selectFilterContextFilters,
        selectCrossFilteringItems,
        withCommonDateFilterAndWithoutCrossFiltering,
    );

/**
 * @alpha
 */
export const selectDashboardHiddenFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectExecutableDashboardFiltersWithoutCrossFiltering,
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
    selectExecutableDashboardFiltersWithoutCrossFiltering,
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
        selectAllDashboardFiltersWithoutCrossFiltering,
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
    selectUnavailableObjects,
    automationDefaultSelectedFilters,
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
        if (isDashboardAttributeFilterItem(filter)) {
            const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
            if (localIdentifier) {
                return !crossFilteringFilterLocalIdentifiers.includes(localIdentifier);
            }
        }

        return true;
    });
};

function isEmptyDashboardFilter(filter: FilterContextItem) {
    if (isDashboardAttributeFilterItem(filter)) {
        return isAllValuesDashboardAttributeFilter(filter);
    }
    if (isDashboardMeasureValueFilter(filter)) {
        return isAllDashboardMeasureValueFilter(filter);
    }

    return false;
}

/**
 * Preselects the filters a new automation starts with. A restricted filter is left out, because the
 * user cannot review what it filters by.
 */
function automationDefaultSelectedFilters(
    filters: FilterContextItem[],
    unavailableObjects: IUnavailableDashboardReference[],
) {
    return filters.filter(
        (filter) =>
            !isEmptyDashboardFilter(filter) && !isDashboardFilterRestricted(filter, unavailableObjects),
    );
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

    if (isDashboardAttributeFilterItem(filter)) {
        const attributeFilterLocalIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
        const config = attributeFilterConfigs.find(
            (attributeFilterConfig) =>
                attributeFilterConfig.localIdentifier === attributeFilterLocalIdentifier,
        );

        return config?.mode === "hidden";
    } else if (isDashboardDateFilter(filter)) {
        if ((isDashboardCommonDateFilter as RelaxedDateFilterGuard)(filter)) {
            return commonDateFilterConfig?.mode === "hidden";
        } else if ((isDashboardDateFilterWithDimension as RelaxedDateFilterGuard)(filter)) {
            const config = dateFilterWithDimensionConfigs.find((date) =>
                areObjRefsEqual(date.dateDataSet, filter.dateFilter.dataSet),
            );

            return config?.config.mode === "hidden";
        }
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

    if (isDashboardAttributeFilterItem(filter)) {
        const attributeFilterLocalIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
        const config = attributeFilterConfigs.find(
            (attributeFilterConfig) =>
                attributeFilterConfig.localIdentifier === attributeFilterLocalIdentifier,
        );

        return config?.mode === "readonly";
    } else if (isDashboardDateFilter(filter)) {
        if ((isDashboardCommonDateFilter as RelaxedDateFilterGuard)(filter)) {
            return commonDateFilterConfig?.mode === "readonly";
        } else if ((isDashboardDateFilterWithDimension as RelaxedDateFilterGuard)(filter)) {
            const config = dateFilterWithDimensionConfigs.find((date) =>
                areObjRefsEqual(date.dateDataSet, filter.dateFilter.dataSet),
            );

            return config?.config.mode === "readonly";
        }
    }

    return false;
};

//
// Per-tab automation filter selectors
//

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
    selectUnavailableObjects,
    selectDateFilterConfigOverridesByTab,
    selectDateFilterConfigsOverridesByTab,
    selectAttributeFilterConfigsOverridesByTab,
    selectCrossFilteringItemsByTab,
    (
        tabs,
        filtersByTab,
        unavailableObjects,
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

            // A restricted filter cannot gate the user's automation, because they can neither see
            // nor change it.
            const unrestrictedFilters = filtersWithCommonDate.filter(
                (filter) => !isDashboardFilterRestricted(filter, unavailableObjects),
            );
            const selectableFilters = removeHiddenFilters(unrestrictedFilters, filterConfigurations);

            // Get locked filters
            const lockedFilters = unrestrictedFilters.filter((filter) =>
                isFilterContextItemLocked(filter, filterConfigurations),
            );

            // Get hidden filters
            const hiddenFilters = unrestrictedFilters.filter((filter) =>
                isFilterContextItemHidden(filter, filterConfigurations),
            );

            // Get default selected filters (noop "All" filters removed — attribute and MVF)
            const defaultSelectedFilters = automationDefaultSelectedFilters(
                availableFilters,
                unavailableObjects,
            );

            return {
                tabId,
                tabTitle,
                availableFilters,
                selectableFilters,
                defaultSelectedFilters,
                lockedFilters,
                hiddenFilters,
            };
        });
    },
);
