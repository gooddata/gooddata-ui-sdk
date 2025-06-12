// (C) 2025 GoodData Corporation

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import { FilterContextItem, isDashboardDateFilter } from "@gooddata/sdk-model";

export const addFilterLocalIdentifier = (filter: FilterContextItem, index: number): FilterContextItem => {
    if (isDashboardDateFilter(filter) && !filter.dateFilter.localIdentifier) {
        return {
            ...filter,
            dateFilter: {
                ...filter.dateFilter,
                localIdentifier: generateDateFilterLocalIdentifier(index, filter.dateFilter.dataSet),
            },
        };
    } else {
        return filter;
    }
};
