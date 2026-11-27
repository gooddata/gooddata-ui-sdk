// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import { invariant } from "ts-invariant";

import {
    type DashboardDateFilterOfAnyType,
    type IDashboardAttributeFilterByDate,
    type ObjRef,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
    isDashboardAbsoluteGranularityDateFilter,
    isDashboardParameterizedDateFilter,
    isUriRef,
} from "@gooddata/sdk-model";

import { type IDashboardDependentDateFilter } from "../../../../../../model/types/dateFilterTypes.js";

/**
 * @internal
 */
export function useDependentDateFilterConfigurationState(
    neighborFilters: DashboardDateFilterOfAnyType[],
    commonDateFilter?: DashboardDateFilterOfAnyType,
    filterElementsByDate?: IDashboardAttributeFilterByDate[],
) {
    const neighborDateFiltersWithDimensions: IDashboardDependentDateFilter[] = useMemo(() => {
        return neighborFilters.map((neighborFilter) => {
            const neighborDataSet = dashboardFilterObjRef(neighborFilter);

            invariant(!isUriRef(neighborDataSet));

            // Prefer the filter's own localIdentifier over the dataset identifier so that multiple date
            // filters backed by the same dataset can be told apart. Falls back to the dataset identifier
            // for date filters that don't carry a localIdentifier (e.g. older backend records).
            const filterLocalIdentifier =
                dashboardFilterLocalIdentifier(neighborFilter) ?? neighborDataSet?.identifier;

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
                ...getDateFilterRange(neighborFilter),
                localIdentifier: filterLocalIdentifier,
                isSelected,
                dataSet: neighborDataSet,
                isCommonDate: false,
            };
        });
    }, [neighborFilters, filterElementsByDate]);

    const commonDateFilters: IDashboardDependentDateFilter[] = useMemo(() => {
        const commonDateRange = getDateFilterRange(commonDateFilter);

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
                    ...commonDateRange,
                    localIdentifier: dimension.identifier,
                    isSelected: true,
                    dataSet: dimension,
                    isCommonDate: true,
                };
            });
    }, [filterElementsByDate, commonDateFilter]);

    return [...neighborDateFiltersWithDimensions, ...commonDateFilters];
}

export function useDependentCommonDateFilterConfigurationState(
    commonDateFilter?: DashboardDateFilterOfAnyType,
): DashboardDateFilterOfAnyType {
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

/**
 * Returns the type and the range of a date filter for the parent filter configuration, All time when there is
 * no filter, for example when the dashboard has no common date filter.
 *
 * @remarks
 * The absolute date filter with granularity is described as an absolute one, its periods are not day dates
 * and its granularity is not a date filter granularity, so they are left out. The parameterized date filter
 * holds no period, it is described the same way.
 *
 * @internal
 */
export function getDateFilterRange(
    dateFilter?: DashboardDateFilterOfAnyType,
): Pick<IDashboardDependentDateFilter, "type" | "granularity" | "from" | "to"> {
    if (!dateFilter) {
        return { granularity: "GDC.time.date", type: "relative" };
    }
    if (
        isDashboardAbsoluteGranularityDateFilter(dateFilter) ||
        isDashboardParameterizedDateFilter(dateFilter)
    ) {
        return { type: "absolute" };
    }
    const { from, to, granularity, type } = dateFilter.dateFilter;

    return { from, to, granularity, type };
}
