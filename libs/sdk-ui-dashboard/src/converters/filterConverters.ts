// (C) 2020-2026 GoodData Corporation

import {
    type DashboardAttributeFilterItem,
    type FilterContextItem,
    type IAttributeFilter,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDateFilter,
    type IFilterContext,
    type IFilterContextDefinition,
    type IFilterableWidget,
    type ITempFilterContext,
    type IWidgetDefinition,
    type ObjRef,
    isAllTimeDashboardDateFilter,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardDateFilter,
    isDashboardMatchAttributeFilter,
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newArbitraryAttributeFilter,
    newMatchAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { type IDashboardFilter } from "../types.js";

/**
 * Gets {@link IDashboardFilter} items for filters specified in given filterContext in relation to the given widget.
 *
 * @param filterContext - filter context to get filters for
 * @param widget - widget to use to get dateDataSet for date filters
 * @public
 */
export function filterContextToDashboardFiltersByWidget(
    filterContext: IFilterContextDefinition | IFilterContext | ITempFilterContext | undefined,
    widget: IWidgetDefinition,
): IDashboardFilter[] {
    if (!filterContext) {
        return [];
    }

    return filterContextItemsToDashboardFiltersByWidget(filterContext.filters, widget);
}

/**
 * Gets {@link IDashboardFilter} items for filters specified in given filterContext in relation to the
 * given dateDataSet.
 *
 * @param filterContext - filter context to get filters for
 * @param dateDataSet - widget to use to get dateDataSet for date filters
 * @public
 */
export function filterContextToDashboardFiltersByDateDataSet(
    filterContext: IFilterContextDefinition | IFilterContext | ITempFilterContext | undefined,
    dateDataSet: ObjRef,
): IDashboardFilter[] {
    if (!filterContext) {
        return [];
    }

    return filterContextItemsToDashboardFiltersByDateDataSet(filterContext.filters, dateDataSet);
}

/**
 * Converts {@link @gooddata/sdk-backend-spi#IDashboardAttributeFilter} to {@link @gooddata/sdk-model#IAttributeFilter} instance.
 *
 * @param filter - filter context attribute filter to convert
 * @deprecated Use {@link dashboardAttributeFilterItemToAttributeFilter} instead,
 * which supports all attribute filter types including text filters.
 * @public
 */
export function dashboardAttributeFilterToAttributeFilter(
    filter: IDashboardAttributeFilter,
): IAttributeFilter {
    if (filter.attributeFilter.negativeSelection) {
        return newNegativeAttributeFilter(
            filter.attributeFilter.displayForm,
            filter.attributeFilter.attributeElements,
            filter.attributeFilter.localIdentifier,
        );
    }

    return newPositiveAttributeFilter(
        filter.attributeFilter.displayForm,
        filter.attributeFilter.attributeElements,
        filter.attributeFilter.localIdentifier,
    );
}

/**
 * Converts any {@link @gooddata/sdk-model#DashboardAttributeFilterItem} to {@link @gooddata/sdk-model#IAttributeFilter} instance.
 *
 * @remarks
 * Handles all attribute filter types: element-based (positive/negative selection),
 * arbitrary value filters, and match (text) filters.
 *
 * @param filter - dashboard attribute filter item to convert
 * @public
 */
export function dashboardAttributeFilterItemToAttributeFilter(
    filter: DashboardAttributeFilterItem,
): IAttributeFilter {
    if (isDashboardArbitraryAttributeFilter(filter)) {
        const { displayForm, values, negativeSelection, localIdentifier } = filter.arbitraryAttributeFilter;
        return newArbitraryAttributeFilter(displayForm, values, negativeSelection, localIdentifier);
    }
    if (isDashboardMatchAttributeFilter(filter)) {
        const { displayForm, operator, literal, caseSensitive, negativeSelection, localIdentifier } =
            filter.matchAttributeFilter;
        return newMatchAttributeFilter(
            displayForm,
            operator,
            literal,
            { caseSensitive, negativeSelection },
            localIdentifier,
        );
    }

    if (filter.attributeFilter.negativeSelection) {
        return newNegativeAttributeFilter(
            filter.attributeFilter.displayForm,
            filter.attributeFilter.attributeElements,
            filter.attributeFilter.localIdentifier,
        );
    }

    return newPositiveAttributeFilter(
        filter.attributeFilter.displayForm,
        filter.attributeFilter.attributeElements,
        filter.attributeFilter.localIdentifier,
    );
}

/**
 * Converts {@link @gooddata/sdk-backend-spi#IDashboardDateFilter} to {@link @gooddata/sdk-model#IDateFilter} instance.
 *
 * @param filter - filter context attribute filter to convert
 * @param widget - widget to use to get dateDataSet for date filters
 * @public
 */
export function dashboardDateFilterToDateFilterByWidget(
    filter: IDashboardDateFilter,
    widget?: Partial<IFilterableWidget>,
): IDateFilter {
    if (isAllTimeDashboardDateFilter(filter)) {
        const dataSet = widget
            ? filter.dateFilter.dataSet || widget.dateDataSet!
            : filter.dateFilter.dataSet!;
        return newAllTimeFilter(
            dataSet,
            filter.dateFilter.localIdentifier,
            filter.dateFilter.emptyValueHandling,
        );
    }

    if (filter.dateFilter.type === "relative") {
        return newRelativeDateFilter(
            widget ? filter.dateFilter.dataSet || widget.dateDataSet! : filter.dateFilter.dataSet!,
            filter.dateFilter.granularity,
            numberOrStringToNumber(filter.dateFilter.from!),
            numberOrStringToNumber(filter.dateFilter.to!),
            filter.dateFilter.localIdentifier,
            filter.dateFilter.boundedFilter,
            filter.dateFilter.emptyValueHandling,
        );
    } else {
        return newAbsoluteDateFilter(
            widget ? filter.dateFilter.dataSet || widget.dateDataSet! : filter.dateFilter.dataSet!,
            filter.dateFilter.from!.toString(),
            filter.dateFilter.to!.toString(),
            filter.dateFilter.localIdentifier,
            filter.dateFilter.emptyValueHandling,
        );
    }
}

/**
 * Converts {@link @gooddata/sdk-backend-spi#IDashboardDateFilter} to {@link @gooddata/sdk-model#IDateFilter} instance.
 *
 * @param filter - filter context attribute filter to convert
 * @param dateDataSet - date data set to define {@link @gooddata/sdk-model#IDateFilter}
 * @public
 */
export function dashboardDateFilterToDateFilterByDateDataSet(
    filter: IDashboardDateFilter,
    dateDataSet: ObjRef,
): IDateFilter {
    if (isAllTimeDashboardDateFilter(filter)) {
        return newAllTimeFilter(
            dateDataSet,
            filter.dateFilter.localIdentifier,
            filter.dateFilter.emptyValueHandling,
        );
    }

    if (filter.dateFilter.type === "relative") {
        return newRelativeDateFilter(
            dateDataSet,
            filter.dateFilter.granularity,
            numberOrStringToNumber(filter.dateFilter.from!),
            numberOrStringToNumber(filter.dateFilter.to!),
            filter.dateFilter.localIdentifier,
            filter.dateFilter.boundedFilter,
            filter.dateFilter.emptyValueHandling,
        );
    } else {
        return newAbsoluteDateFilter(
            dateDataSet,
            filter.dateFilter.from!.toString(),
            filter.dateFilter.to!.toString(),
            filter.dateFilter.localIdentifier,
            filter.dateFilter.emptyValueHandling,
        );
    }
}

/**
 * Gets {@link IDashboardFilter} items for filters specified as {@link @gooddata/sdk-backend-spi#FilterContextItem} instances.
 *
 * @param filterContextItems - filter context items to get filters for
 * @param widget - widget to use to get dateDataSet for date filters
 * @public
 */
export function filterContextItemsToDashboardFiltersByWidget(
    filterContextItems: FilterContextItem[],
    widget?: Partial<IFilterableWidget>,
): IDashboardFilter[] {
    return filterContextItems
        .filter(
            (filter): filter is DashboardAttributeFilterItem | IDashboardDateFilter =>
                isDashboardAttributeFilterItem(filter) || isDashboardDateFilter(filter),
        )
        .map((filter) => {
            if (isDashboardAttributeFilterItem(filter)) {
                return dashboardAttributeFilterItemToAttributeFilter(filter);
            } else {
                return dashboardDateFilterToDateFilterByWidget(filter, widget);
            }
        });
}

/**
 * Gets {@link IDashboardFilter} items for filters specified as {@link @gooddata/sdk-backend-spi#FilterContextItem} instances.
 *
 * @param filterContextItems - filter context items to get filters for
 * @param widget - widget to use to get dateDataSet for date filters
 * @public
 */
export function filterContextItemsToDashboardFiltersByRichTextWidget(
    filterContextItems: FilterContextItem[],
    widget?: Partial<IFilterableWidget>,
): IDashboardFilter[] {
    return filterContextItems
        .filter(
            (filter): filter is DashboardAttributeFilterItem | IDashboardDateFilter =>
                isDashboardAttributeFilterItem(filter) || isDashboardDateFilter(filter),
        )
        .map((filter) => {
            if (isDashboardAttributeFilterItem(filter)) {
                return dashboardAttributeFilterItemToAttributeFilter(filter);
            } else {
                return dashboardDateFilterToDateFilterByWidget(filter, widget);
            }
        })
        .filter(Boolean) as IDashboardFilter[];
}

/**
 * Gets {@link IDashboardFilter} items for filters specified as {@link @gooddata/sdk-backend-spi#FilterContextItem} instances.
 *
 * @param filterContextItems - filter context items to get filters for
 * @param dateDataSet - date data set to define {@link @gooddata/sdk-model#IDateFilter}
 * @public
 */
export function filterContextItemsToDashboardFiltersByDateDataSet(
    filterContextItems: FilterContextItem[],
    dateDataSet: ObjRef,
): IDashboardFilter[] {
    return filterContextItems
        .filter(
            (filter): filter is DashboardAttributeFilterItem | IDashboardDateFilter =>
                isDashboardAttributeFilterItem(filter) || isDashboardDateFilter(filter),
        )
        .map((filter) => {
            if (isDashboardAttributeFilterItem(filter)) {
                return dashboardAttributeFilterItemToAttributeFilter(filter);
            } else {
                return dashboardDateFilterToDateFilterByDateDataSet(filter, dateDataSet);
            }
        });
}

function numberOrStringToNumber(input: number | string): number {
    return typeof input === "string" ? Number.parseInt(input) : input;
}
