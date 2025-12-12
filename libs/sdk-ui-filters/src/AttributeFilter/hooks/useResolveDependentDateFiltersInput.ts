// (C) 2024-2025 GoodData Corporation

import { useMemo } from "react";

import {
    type IAbsoluteDateFilter,
    type IDashboardDateFilter,
    type IRelativeDateFilter,
    isAllTimeDashboardDateFilter,
    isRelativeDashboardDateFilter,
    newAbsoluteDateFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export const useResolveDependentDateFiltersInput = (
    dependentDateFilters?: IDashboardDateFilter[],
): (IRelativeDateFilter | IAbsoluteDateFilter)[] => {
    return useMemo(() => {
        if (!dependentDateFilters) {
            return [];
        }

        return dependentDateFilters
            .map((dependentDateFilter) => {
                const { dataSet, granularity, from, to, localIdentifier, boundedFilter } =
                    dependentDateFilter.dateFilter;
                if (isRelativeDashboardDateFilter(dependentDateFilter)) {
                    // Ignore only date filters set as "All time"
                    if (isAllTimeDashboardDateFilter(dependentDateFilter)) {
                        return undefined;
                    }

                    const parsedFrom = from ? Number.parseInt(from.toString(), 10) : 0;
                    const parsedTo = to ? Number.parseInt(to.toString(), 10) : 0;

                    return newRelativeDateFilter(
                        dataSet!,
                        granularity,
                        parsedFrom,
                        parsedTo,
                        localIdentifier,
                        boundedFilter,
                    );
                } else {
                    return newAbsoluteDateFilter(dataSet!, from!.toString(), to!.toString(), localIdentifier);
                }
            })
            .filter((f): f is IRelativeDateFilter | IAbsoluteDateFilter => f !== undefined);
    }, [dependentDateFilters]);
};
