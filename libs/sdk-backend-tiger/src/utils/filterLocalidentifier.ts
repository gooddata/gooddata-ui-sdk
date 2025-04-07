// (C) 2025 GoodData Corporation

import {
    FilterContextItem,
    IDashboardDateFilter,
    isDashboardDateFilter,
    isDashboardDateFilterWithDimension,
    objRefToString,
} from "@gooddata/sdk-model";

const generateDateFilterLocalIdentifier = (filter: IDashboardDateFilter, index: number): string => {
    if (isDashboardDateFilterWithDimension(filter)) {
        const ref = filter.dateFilter.dataSet;
        return ref ? `${objRefToString(ref)}_${index}_dateFilter` : `${index}_dateFilter`;
    }

    return `common_${index}_dateFilter`;
};

export const addFilterLocalIdentifier = (filter: FilterContextItem, index: number): FilterContextItem => {
    if (isDashboardDateFilter(filter) && !filter.dateFilter.localIdentifier) {
        return {
            ...filter,
            dateFilter: {
                ...filter.dateFilter,
                localIdentifier: generateDateFilterLocalIdentifier(filter, index),
            },
        };
    } else {
        return filter;
    }
};
