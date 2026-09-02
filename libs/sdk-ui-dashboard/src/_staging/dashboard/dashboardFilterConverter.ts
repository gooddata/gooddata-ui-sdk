// (C) 2021-2026 GoodData Corporation

import {
    type DateFilterGranularity,
    type IDashboardDateFilter,
    type ObjRef,
    absoluteDateFilterValues,
    idRef,
    isEmptyValuesDateFilterOption,
    isRelativeDateFilter,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import { DateFilterHelpers, type DateFilterOption } from "@gooddata/sdk-ui-filters";

/**
 * Converts {@link DateFilterOption} to {@link IDashboardDateFilter}.
 *
 * @param dateFilterOption - date filter option to convert
 * @param excludeCurrentPeriod - whether or not to exclude the current period
 * @returns converted filter
 */
export function dateFilterOptionToDashboardDateFilter(
    dateFilterOption: DateFilterOption,
    excludeCurrentPeriod: boolean,
    dataSet?: ObjRef,
    localIdentifier?: string,
): IDashboardDateFilter | undefined {
    const emptyValueHandling = isEmptyValuesDateFilterOption(dateFilterOption)
        ? "only"
        : dateFilterOption.emptyValueHandling;
    const tempDateDatasetId = dataSet ?? idRef("TEMP");
    const afmFilter = DateFilterHelpers.mapOptionToAfm(
        dateFilterOption,
        tempDateDatasetId,
        excludeCurrentPeriod,
    );

    if (!afmFilter) {
        // All time filter representation
        return {
            dateFilter: {
                type: "relative",
                granularity: "GDC.time.date",
                dataSet,
                localIdentifier,
                ...(emptyValueHandling ? { emptyValueHandling } : {}),
            },
        };
    }

    if (isRelativeDateFilter(afmFilter)) {
        const { from, to, granularity, boundedFilter } = relativeDateFilterValues(afmFilter);
        return {
            dateFilter: {
                type: "relative",
                granularity: granularity as DateFilterGranularity,
                from,
                to,
                dataSet,
                localIdentifier,
                boundedFilter,
                ...(emptyValueHandling ? { emptyValueHandling } : {}),
            },
        };
    } else {
        const { from, to } = absoluteDateFilterValues(afmFilter);
        return {
            dateFilter: {
                type: "absolute",
                granularity: "GDC.time.date",
                from,
                to,
                dataSet,
                localIdentifier,
                ...(emptyValueHandling ? { emptyValueHandling } : {}),
            },
        };
    }
}
