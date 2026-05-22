// (C) 2021-2026 GoodData Corporation

import {
    type FilterContextItem,
    type IDashboardFilterGroup,
    type IDashboardFilterGroupsConfig,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    isDashboardAttributeFilterItem,
    isDashboardDateFilter,
    isDashboardMeasureValueFilter,
} from "@gooddata/sdk-model";

import {
    type FilterBarItem,
    isFilterBarFilterGroupItem,
    isFilterBarFilterPlaceholder,
} from "./useFiltersWithAddedPlaceholder.js";

function findGroupForFilter(
    item: FilterContextItem,
    filterGroupsConfig?: IDashboardFilterGroupsConfig,
): IDashboardFilterGroup | undefined {
    return filterGroupsConfig?.groups.find((group) =>
        group.filters.some((filter) => {
            if (isDashboardAttributeFilterItem(item)) {
                return filter.filterLocalIdentifier === dashboardAttributeFilterItemLocalIdentifier(item);
            }
            if (isDashboardDateFilter(item)) {
                return filter.filterLocalIdentifier === item.dateFilter.localIdentifier;
            }
            if (isDashboardMeasureValueFilter(item)) {
                return filter.filterLocalIdentifier === dashboardFilterLocalIdentifier(item);
            }
            return false;
        }),
    );
}

export function groupFilterItems(
    items: FilterBarItem[],
    filterGroupsConfig?: IDashboardFilterGroupsConfig,
): FilterBarItem[] {
    const groupedItems: FilterBarItem[] = [];
    for (const item of items) {
        if (isFilterBarFilterGroupItem(item)) {
            groupedItems.push({ ...item, filterIndex: groupedItems.length });
            continue;
        }
        if (isFilterBarFilterPlaceholder(item)) {
            groupedItems.push({ ...item, filterIndex: groupedItems.length });
            continue;
        }
        const groupConfig = findGroupForFilter(item.filter, filterGroupsConfig);
        const groupItem = groupedItems
            .filter((item) => "groupConfig" in item)
            .find((item) => item.groupConfig === groupConfig);
        if (groupItem) {
            // add filter to aready found group
            groupItem.filters.push({ ...item, filterIndex: groupItem.filters.length });
        } else if (groupConfig) {
            // create new group
            groupedItems.push({
                groupConfig,
                filters: [{ ...item, filterIndex: 0 }],
                filterIndex: groupedItems.length,
            });
        } else {
            // not part of any group
            groupedItems.push({ ...item, filterIndex: groupedItems.length });
        }
    }
    return groupedItems;
}
