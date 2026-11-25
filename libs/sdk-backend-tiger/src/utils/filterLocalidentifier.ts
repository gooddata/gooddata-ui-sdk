// (C) 2025-2026 GoodData Corporation

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    type FilterContextItem,
    isDashboardAbsoluteGranularityDateFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";

export const addFilterLocalIdentifier = (filter: FilterContextItem, index: number): FilterContextItem => {
    if (isDashboardDateFilter(filter) && !filter.dateFilter.localIdentifier) {
        return {
            ...filter,
            dateFilter: {
                ...filter.dateFilter,
                localIdentifier: generateDateFilterLocalIdentifier(index, filter.dateFilter.dataSet),
            },
        };
    } else if (
        isDashboardAbsoluteGranularityDateFilter(filter) &&
        !filter.dashboardAbsoluteGranularityDateFilter.localIdentifier
    ) {
        return {
            ...filter,
            dashboardAbsoluteGranularityDateFilter: {
                ...filter.dashboardAbsoluteGranularityDateFilter,
                localIdentifier: generateDateFilterLocalIdentifier(
                    index,
                    filter.dashboardAbsoluteGranularityDateFilter.dataSet,
                ),
            },
        };
    } else {
        return filter;
    }
};
