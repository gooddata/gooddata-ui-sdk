// (C) 2024 GoodData Corporation
import { useMemo } from "react";
import { invariant } from "ts-invariant";

import { IDashboardAttributeFilterByDate, IDashboardDateFilter, isUriRef } from "@gooddata/sdk-model";

import { IDashboardDependentDateFilter } from "../../../../../../model/index.js";

/**
 * @internal
 */
export function useDependentDateFilterConfigurationState(
    neighborFilters: IDashboardDateFilter[],
    commonDateFilter?: IDashboardDateFilter,
    filterElementsByDate?: IDashboardAttributeFilterByDate[],
) {
    const neighborDateFiltersWithDimensions: IDashboardDependentDateFilter[] = useMemo(() => {
        return neighborFilters.map((neighborFilter) => {
            const neighborLocalId = neighborFilter.dateFilter.dataSet;

            invariant(!isUriRef(neighborLocalId));

            const isSelected =
                filterElementsByDate?.some(
                    (by) => by.filterLocalIdentifier === neighborLocalId?.identifier && !by.isCommonDate,
                ) || false;

            invariant(
                neighborLocalId?.identifier,
                "Cannot initialize the attribute filter configuration panel, neighbor date filter has missing 'localIdentifier' property.",
            );

            return {
                localIdentifier: neighborLocalId.identifier,
                isSelected,
                dataSet: neighborFilter.dateFilter.dataSet,
                from: neighborFilter.dateFilter.from,
                to: neighborFilter.dateFilter.to,
                granularity: neighborFilter.dateFilter.granularity,
                type: neighborFilter.dateFilter.type,
                isCommonDate: false,
            };
        });
    }, [neighborFilters, filterElementsByDate]);

    const commonDateFilters: IDashboardDependentDateFilter[] = useMemo(() => {
        const commonDate = parseCommonDateFilter(commonDateFilter);

        return (filterElementsByDate ?? [])
            .filter((parent) => parent.isCommonDate)
            .map((parent) => ({
                localIdentifier: parent.filterLocalIdentifier,
                isSelected: true,
                dataSet: {
                    identifier: parent.filterLocalIdentifier,
                    type: "dataSet",
                },
                from: commonDate.from,
                to: commonDate.to,
                granularity: commonDate.granularity,
                type: commonDate.type,
                isCommonDate: true,
            }));
    }, [filterElementsByDate, commonDateFilter]);

    return [...neighborDateFiltersWithDimensions, ...commonDateFilters];
}

export function useDependentCommonDateFilterConfigurationState(
    commonDateFilter?: IDashboardDateFilter,
): IDashboardDateFilter {
    if (commonDateFilter) {
        return commonDateFilter;
    } else {
        return {
            dateFilter: {
                granularity: "GDC.time.date",
                type: "relative",
            },
        };
    }
}

const parseCommonDateFilter = (commonDate?: IDashboardDateFilter): IDashboardDependentDateFilter => {
    if (commonDate) {
        return {
            from: commonDate.dateFilter.from,
            to: commonDate.dateFilter.to,
            granularity: commonDate.dateFilter.granularity,
            type: commonDate.dateFilter.type,
            localIdentifier: "commonDate",
            isCommonDate: true,
        };
    } else {
        return {
            granularity: "GDC.time.date",
            type: "relative",
            localIdentifier: "commonDate",
            isCommonDate: true,
        };
    }
};
