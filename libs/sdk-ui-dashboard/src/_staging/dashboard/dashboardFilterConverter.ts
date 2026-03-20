// (C) 2021-2026 GoodData Corporation

import {
    type DashboardAttributeFilterItem,
    type DashboardAttributeFilterSelectionMode,
    type DateFilterGranularity,
    type IAttributeElement,
    type IAttributeElements,
    type IAttributeElementsByRef,
    type IAttributeFilter,
    type IDashboardArbitraryAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardMatchAttributeFilter,
    type ObjRef,
    absoluteDateFilterValues,
    filterAttributeElements,
    filterObjRef,
    idRef,
    isArbitraryAttributeFilter,
    isAttributeFilterWithSelection,
    isEmptyValuesDateFilterOption,
    isMatchAttributeFilter,
    isNegativeAttributeFilter,
    isRelativeDateFilter,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import { DateFilterHelpers, type DateFilterOption } from "@gooddata/sdk-ui-filters";

/**
 * Converts {@link IAttributeFilter} to {@link DashboardAttributeFilterItem}.
 *
 * @remarks
 * For arbitrary and match filters, returns the corresponding dedicated dashboard filter type
 * with full lossless conversion. For element-based filters, returns {@link IDashboardAttributeFilter}.
 *
 * @internal
 * @param filter - filter to convert
 * @param localIdentifier - localIdentifier of the filter
 * @param title - custom title of the filter
 * @param attributeElements - currently selected elements. Only used for element-based filters.
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
): DashboardAttributeFilterItem {
    if (isArbitraryAttributeFilter(filter)) {
        const result: IDashboardArbitraryAttributeFilter = {
            arbitraryAttributeFilter: {
                displayForm: filterObjRef(filter),
                values: filter.arbitraryAttributeFilter.values,
                negativeSelection: filter.arbitraryAttributeFilter.negativeSelection ?? false,
                localIdentifier,
                title,
            },
        };
        return result;
    }

    if (isMatchAttributeFilter(filter)) {
        const result: IDashboardMatchAttributeFilter = {
            matchAttributeFilter: {
                displayForm: filterObjRef(filter),
                operator: filter.matchAttributeFilter.operator,
                literal: filter.matchAttributeFilter.literal,
                caseSensitive: filter.matchAttributeFilter.caseSensitive,
                negativeSelection: filter.matchAttributeFilter.negativeSelection ?? false,
                localIdentifier,
                title,
            },
        };
        return result;
    }

    const attributeElementsObj: IAttributeElementsByRef | undefined = attributeElements && {
        uris: attributeElements.map((element) => element.uri),
    };

    let resolvedElements: IAttributeElements | undefined = attributeElementsObj;
    if (!resolvedElements && isAttributeFilterWithSelection(filter)) {
        resolvedElements = filterAttributeElements(filter);
    }

    return {
        attributeFilter: {
            attributeElements: resolvedElements ?? { values: [] },
            displayForm: filterObjRef(filter),
            negativeSelection: isInverted ?? isNegativeAttributeFilter(filter),
            localIdentifier,
            title,
            selectionMode,
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
