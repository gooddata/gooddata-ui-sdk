// (C) 2024-2025 GoodData Corporation
import { isEqual } from "lodash-es";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    FilterContextItem,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    ICrossFilteringItem,
    selectCrossFilteringItems,
    selectDefaultFilterOverrides,
    selectEnableAutomationFilterContext,
    selectEnableDateFilterIdentifiers,
    selectFilterContextFilters,
    selectOriginalFilterContextFilters,
} from "../../store/index.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";

/**
 * Hook to get filters that are available to be used for any automation.
 *
 * - Filters are respecting current set dashboard filter context
 * - Cross-filtering filters are omitted as they are not desired to be saved in the automation
 * - If default dashboard filters has overrides, use them instead of the current dashboard filter context
 * - If common date filter is not present in the dashboard filter context, add it
 *
 * @deprecated - can be removed, once `enableAutomationFilterContext` is removed
 * @alpha
 */
export function useAutomationAvailableDashboardFilters() {
    const originalDashboardFilters = useDashboardSelector(selectOriginalFilterContextFilters);
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const defaultFilterOverrides = useDashboardSelector(selectDefaultFilterOverrides);
    const crossFilteringItems = useDashboardSelector(selectCrossFilteringItems);
    const enableAutomationFilterContext = useDashboardSelector(selectEnableAutomationFilterContext);
    const enableDateFilterIdentifiers = useDashboardSelector(selectEnableDateFilterIdentifiers);

    const dashboardFiltersWithoutCrossFiltering = removeCrossFilteringFilters(
        dashboardFilters,
        crossFilteringItems,
    );

    const shouldFiltersBeSaved =
        defaultFilterOverrides || !isEqual(originalDashboardFilters, dashboardFiltersWithoutCrossFiltering);

    // If there are any default filter overrides (e. g. coming from shared dashboard filter context in url),
    // always store them in the automation. In this case we won't ever need to use the default dashboard filter context.
    // (this is old behaviour of the scheduled export)
    const availableDashboardFilters =
        enableAutomationFilterContext || shouldFiltersBeSaved
            ? dashboardFiltersWithoutCrossFiltering
            : undefined;

    const commonDateFilter: FilterContextItem = newAllTimeDashboardDateFilter(
        undefined,
        enableDateFilterIdentifiers ? generateDateFilterLocalIdentifier(0) : undefined,
    );

    const shouldAddCommonDateFilter =
        enableAutomationFilterContext &&
        availableDashboardFilters &&
        !availableDashboardFilters.some(isDashboardCommonDateFilter);

    return shouldAddCommonDateFilter
        ? [commonDateFilter, ...dashboardFiltersWithoutCrossFiltering]
        : availableDashboardFilters;
}

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
