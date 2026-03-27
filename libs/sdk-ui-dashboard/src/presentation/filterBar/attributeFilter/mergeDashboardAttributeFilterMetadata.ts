// (C) 2026 GoodData Corporation

import {
    type DashboardAttributeFilterItem,
    dashboardAttributeFilterItemFilterElementsBy,
    dashboardAttributeFilterItemFilterElementsByDate,
    dashboardAttributeFilterItemValidateElementsBy,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";

/**
 * Merges dashboard-only metadata into the converted filter.
 *
 * Converters that build a new `DashboardAttributeFilterItem` from selection-only data omit
 * `filterElementsBy`, `filterElementsByDate`, and `validateElementsBy`. Those fields are copied from
 * `originalFilter`. Without this, replacing the whole filter item drops parent filtering and
 * validation config.
 *
 * @internal
 */
export function mergeDashboardAttributeFilterMetadata(
    originalFilter: DashboardAttributeFilterItem,
    convertedFilter: DashboardAttributeFilterItem,
): DashboardAttributeFilterItem {
    const filterElementsBy = dashboardAttributeFilterItemFilterElementsBy(originalFilter);
    const filterElementsByDate = dashboardAttributeFilterItemFilterElementsByDate(originalFilter);
    const validateElementsBy = dashboardAttributeFilterItemValidateElementsBy(originalFilter);
    const metadata = {
        ...(filterElementsBy === undefined ? {} : { filterElementsBy }),
        ...(filterElementsByDate === undefined ? {} : { filterElementsByDate }),
        ...(validateElementsBy === undefined ? {} : { validateElementsBy }),
    };
    if (isDashboardAttributeFilter(convertedFilter)) {
        return {
            attributeFilter: { ...convertedFilter.attributeFilter, ...metadata },
        };
    }
    if (isDashboardArbitraryAttributeFilter(convertedFilter)) {
        return {
            arbitraryAttributeFilter: { ...convertedFilter.arbitraryAttributeFilter, ...metadata },
        };
    }
    return convertedFilter;
}
