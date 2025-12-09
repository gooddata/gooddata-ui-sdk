// (C) 2024-2025 GoodData Corporation
import { useMemo } from "react";

import {
    IAbsoluteDateFilter,
    IDashboardDateFilter,
    IRelativeDateFilter,
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

                const parsedFrom = from ? Number.parseInt(from.toString(), 10) : 0;
                const parsedTo = to ? Number.parseInt(to.toString(), 10) : 0;

                if (isRelativeDashboardDateFilter(dependentDateFilter)) {
                    // Ignore only date filters set as "All time"
                    if (isAllTimeDashboardDateFilter(dependentDateFilter)) {
                        return undefined;
                    }

                    return newRelativeDateFilter(
                        dataSet!,
                        granularity,
                        parsedFrom,
                        parsedTo,
                        localIdentifier,
                        boundedFilter,
                    );
                } else {
                    return newAbsoluteDateFilter(
                        dataSet!,
                        parsedFrom.toString(),
                        parsedTo.toString(),
                        localIdentifier,
                    );
                }
            })
            .filter((f): f is IRelativeDateFilter | IAbsoluteDateFilter => f !== undefined);
    }, [dependentDateFilters]);
};
