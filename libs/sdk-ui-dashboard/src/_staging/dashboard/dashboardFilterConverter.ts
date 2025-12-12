// (C) 2021-2025 GoodData Corporation

import {
    type DashboardAttributeFilterSelectionMode,
    type DateFilterGranularity,
    type IAttributeElement,
    type IAttributeElementsByRef,
    type IAttributeFilter,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type ObjRef,
    absoluteDateFilterValues,
    filterAttributeElements,
    filterObjRef,
    idRef,
    isNegativeAttributeFilter,
    isRelativeDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import { DateFilterHelpers, type DateFilterOption } from "@gooddata/sdk-ui-filters";

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
 * @param attributeElements - currently selected elements. Default is taken from the filter param.
 * @param isInverted - whether filter has negative selection (NOT_IN operator). Default is taken from the filter param.
 * @param selectionMode - selection mode of the filter (single / multi). Default is undefined.
 * @returns converted filter
 */
export function attributeFilterToDashboardAttributeFilter(
    filter: IAttributeFilter,
    localIdentifier: string | undefined,
    title: string | undefined,
    attributeElements?: IAttributeElement[],
    isInverted?: boolean,
    selectionMode?: DashboardAttributeFilterSelectionMode,
): IDashboardAttributeFilter {
    const attributeElementsObj: IAttributeElementsByRef | undefined = attributeElements && {
        uris: attributeElements.map((element) => element.uri),
    };
    return {
        attributeFilter: {
            attributeElements: attributeElementsObj ?? filterAttributeElements(filter),
            displayForm: filterObjRef(filter),
            negativeSelection: isInverted ?? isNegativeAttributeFilter(filter),
            localIdentifier,
            title,
            selectionMode,
            // TODO filterElementsBy?
        },
    };
}

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
            },
        };
    }
}
