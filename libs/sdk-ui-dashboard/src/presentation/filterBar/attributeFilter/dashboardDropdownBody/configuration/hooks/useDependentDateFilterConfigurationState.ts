// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import { invariant } from "ts-invariant";

import {
    type IDashboardAttributeFilterByDate,
    type IDashboardDateFilter,
    type ObjRef,
    isUriRef,
} from "@gooddata/sdk-model";

import { type IDashboardDependentDateFilter } from "../../../../../../model/types/dateFilterTypes.js";

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
            const neighborDataSet = neighborFilter.dateFilter.dataSet;

            invariant(!isUriRef(neighborDataSet));

            // Prefer the filter's own localIdentifier over the dataset identifier so that multiple date
            // filters backed by the same dataset can be told apart. Falls back to the dataset identifier
            // for date filters that don't carry a localIdentifier (e.g. older backend records).
            const filterLocalIdentifier =
                neighborFilter.dateFilter.localIdentifier ?? neighborDataSet?.identifier;

            const isSelected =
                filterElementsByDate?.some(
                    (by) =>
                        // Match against both the new (localIdentifier) and legacy (dataset identifier)
                        // formats: dashboards saved before this change store the dataset identifier in
                        // filterLocalIdentifier, so we must accept either form to stay backwards compatible.
                        (by.filterLocalIdentifier === filterLocalIdentifier ||
                            by.filterLocalIdentifier === neighborDataSet?.identifier) &&
                        !by.isCommonDate,
                ) || false;

            invariant(
                filterLocalIdentifier,
                "Cannot initialize the attribute filter configuration panel, neighbor date filter has missing 'localIdentifier' property.",
            );

            return {
                localIdentifier: filterLocalIdentifier,
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
            .map((parent) => {
                // Resolve the target dimension. New format: the explicit `dataSet` field carries it
                // (filterLocalIdentifier references the common date filter itself). Legacy format: no
                // `dataSet`, so the dimension identifier was stored directly in filterLocalIdentifier.
                // The config item is keyed by the dimension so it matches the per-dimension picker items.
                const dimension: ObjRef = parent.dataSet ?? {
                    identifier: parent.filterLocalIdentifier,
                    type: "dataSet",
                };
                invariant(!isUriRef(dimension));

                return {
                    localIdentifier: dimension.identifier,
                    isSelected: true,
                    dataSet: dimension,
                    from: commonDate.from,
                    to: commonDate.to,
                    granularity: commonDate.granularity,
                    type: commonDate.type,
                    isCommonDate: true,
                };
            });
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
