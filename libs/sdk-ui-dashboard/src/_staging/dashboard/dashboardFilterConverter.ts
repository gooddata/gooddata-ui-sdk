// (C) 2021-2022 GoodData Corporation

import {
    absoluteDateFilterValues,
    filterAttributeElements,
    filterObjRef,
    IAttributeFilter,
    idRef,
    isNegativeAttributeFilter,
    isRelativeDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    relativeDateFilterValues,
    DateFilterGranularity,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
} from "@gooddata/sdk-model";
import { DateFilterHelpers, DateFilterOption } from "@gooddata/sdk-ui-filters";

/**
 * Converts {@link IDashboardAttributeFilter} to {@link IAttributeFilter}.
 *
 * @internal
 * @param dashboardFilter - filter to convert
 * @returns converted filter
 */
export function dashboardAttributeFilterToAttributeFilter(
    dashboardFilter: IDashboardAttributeFilter,
): IAttributeFilter {
    const { attributeElements, displayForm, negativeSelection } = dashboardFilter.attributeFilter;
    if (negativeSelection) {
        return newNegativeAttributeFilter(displayForm, attributeElements);
    } else {
        return newPositiveAttributeFilter(displayForm, attributeElements);
    }
}

/**
 * Converts {@link IAttributeFilter} to {@link IDashboardAttributeFilter}.
 *
 * @internal
 * @param filter - filter to convert
 * @param localIdentifier - localIdentifier of the filter
 * @returns converted filter
 */
export function attributeFilterToDashboardAttributeFilter(
    filter: IAttributeFilter,
    localIdentifier: string | undefined,
): IDashboardAttributeFilter {
    const attributeElements = filterAttributeElements(filter);
    const displayForm = filterObjRef(filter);
    return {
        attributeFilter: {
            attributeElements,
            displayForm,
            negativeSelection: isNegativeAttributeFilter(filter),
            localIdentifier,
            // TODO filterElementsBy?
        },
    };
}

/**
 * Converts {@link DateFilterOption} to {@link IDashboardDateFilter} or undefined.
 *
 * @param dateFilterOption - date filter option to convert
 * @param excludeCurrentPeriod - whether or not to exclude the current period
 * @returns converted filter or undefined for All time filter
 */
export function dateFilterOptionToDashboardDateFilter(
    dateFilterOption: DateFilterOption,
    excludeCurrentPeriod: boolean,
): IDashboardDateFilter | undefined {
    const tempDateDatasetId = idRef("TEMP");
    const afmFilter = DateFilterHelpers.mapOptionToAfm(
        dateFilterOption,
        tempDateDatasetId,
        excludeCurrentPeriod,
    );

    if (!afmFilter) {
        return undefined;
    }

    if (isRelativeDateFilter(afmFilter)) {
        const { from, to, granularity } = relativeDateFilterValues(afmFilter);
        return {
            dateFilter: {
                type: "relative",
                granularity: granularity as DateFilterGranularity,
                from,
                to,
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
            },
        };
    }
}
