// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import {
    type IAbsoluteDateFilter,
    type IDashboardDateFilter,
    type IRelativeDateFilter,
    isAllTimeDashboardDateFilter,
    isNoopAllTimeDashboardDateFilter,
    isRelativeDashboardDateFilter,
    newAbsoluteDateFilter,
    newAllTimeFilter,
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
                const { dataSet, granularity, from, to, localIdentifier, boundedFilter, emptyValueHandling } =
                    dependentDateFilter.dateFilter;
                if (isRelativeDashboardDateFilter(dependentDateFilter)) {
                    // Ignore only noop "All time" date filters (implicit default).
                    if (isNoopAllTimeDashboardDateFilter(dependentDateFilter)) {
                        return undefined;
                    }

                    if (isAllTimeDashboardDateFilter(dependentDateFilter)) {
                        return newAllTimeFilter(dataSet!, localIdentifier, emptyValueHandling);
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
                        emptyValueHandling,
                    );
                } else {
                    return newAbsoluteDateFilter(
                        dataSet!,
                        from!.toString(),
                        to!.toString(),
                        localIdentifier,
                        emptyValueHandling,
                    );
                }
            })
            .filter((f): f is IRelativeDateFilter | IAbsoluteDateFilter => f !== undefined);
    }, [dependentDateFilters]);
};
