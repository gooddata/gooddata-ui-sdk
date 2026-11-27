// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import {
    type DashboardDateFilterOfAnyType,
    type IAbsoluteDateFilter,
    type IAbsoluteGranularityDateFilter,
    type IRelativeDateFilter,
    dashboardAbsoluteGranularityDateFilterToDateFilterByWidget,
    isAllTimeDashboardDateFilter,
    isDashboardAbsoluteGranularityDateFilter,
    isDashboardParameterizedDateFilter,
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
    dependentDateFilters?: DashboardDateFilterOfAnyType[],
): (IRelativeDateFilter | IAbsoluteDateFilter | IAbsoluteGranularityDateFilter)[] => {
    return useMemo(() => {
        if (!dependentDateFilters) {
            return [];
        }

        return dependentDateFilters
            .map((dependentDateFilter) => {
                if (isDashboardAbsoluteGranularityDateFilter(dependentDateFilter)) {
                    return dashboardAbsoluteGranularityDateFilterToDateFilterByWidget(dependentDateFilter);
                }
                // its period comes from a parameter value the filter does not hold, so it does not limit
                if (isDashboardParameterizedDateFilter(dependentDateFilter)) {
                    return undefined;
                }

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
                    return newAbsoluteDateFilter(dataSet!, from!.toString(), to!.toString(), {
                        localIdentifier,
                        emptyValueHandling,
                        granularity,
                    });
                }
            })
            .filter(
                (f): f is IRelativeDateFilter | IAbsoluteDateFilter | IAbsoluteGranularityDateFilter =>
                    f !== undefined,
            );
    }, [dependentDateFilters]);
};
