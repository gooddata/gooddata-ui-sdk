// (C) 2020-2022 GoodData Corporation
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IFilterableWidget,
    IFilterContext,
    IFilterContextDefinition,
    isDashboardAttributeFilter,
    ITempFilterContext,
    IWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
    newAbsoluteDateFilter,
    IAttributeFilter,
    IDateFilter,
} from "@gooddata/sdk-model";
import isString from "lodash/isString";

import { IDashboardFilter } from "../types";

/**
 * Gets {@link IDashboardFilter} items for filters specified in given filterContext in relation to the given widget.
 *
 * forWidget...
 *
 * @param filterContext - filter context to get filters for
 * @param widget - widget to use to get dateDataSet for date filters
 * @public
 */
export function filterContextToDashboardFilters(
    filterContext: IFilterContextDefinition | IFilterContext | ITempFilterContext | undefined,
    widget: IWidgetDefinition,
): IDashboardFilter[] {
    if (!filterContext) {
        return [];
    }

    return filterContextItemsToDashboardFilters(filterContext.filters, widget);
}

/**
 * Converts {@link @gooddata/sdk-backend-spi#IDashboardAttributeFilter} to {@link @gooddata/sdk-model#IAttributeFilter} instance.
 *
 * @param filter - filter context attribute filter to convert
 * @public
 */
export function dashboardAttributeFilterToAttributeFilter(
    filter: IDashboardAttributeFilter,
): IAttributeFilter {
    if (filter.attributeFilter.negativeSelection) {
        return newNegativeAttributeFilter(
            filter.attributeFilter.displayForm,
            filter.attributeFilter.attributeElements,
        );
    }

    return newPositiveAttributeFilter(
        filter.attributeFilter.displayForm,
        filter.attributeFilter.attributeElements,
    );
}

/**
 * Converts {@link @gooddata/sdk-backend-spi#IDashboardDateFilter} to {@link @gooddata/sdk-model#IAttributeFilter} instance.
 *
 * @param filter - filter context attribute filter to convert
 * @param widget - widget to use to get dateDataSet for date filters
 * @public
 */
export function dashboardDateFilterToDateFilter(
    filter: IDashboardDateFilter,
    widget: Partial<IFilterableWidget>,
): IDateFilter {
    if (filter.dateFilter.type === "relative") {
        return newRelativeDateFilter(
            widget.dateDataSet!,
            filter.dateFilter.granularity,
            numberOrStringToNumber(filter.dateFilter.from!),
            numberOrStringToNumber(filter.dateFilter.to!),
        );
    } else {
        return newAbsoluteDateFilter(
            widget.dateDataSet!,
            filter.dateFilter.from!.toString(),
            filter.dateFilter.to!.toString(),
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
export function filterContextItemsToDashboardFilters(
    filterContextItems: FilterContextItem[],
    widget: Partial<IFilterableWidget>,
): IDashboardFilter[] {
    return filterContextItems.map((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            return dashboardAttributeFilterToAttributeFilter(filter);
        } else {
            return dashboardDateFilterToDateFilter(filter, widget);
        }
    });
}

function numberOrStringToNumber(input: number | string): number {
    return isString(input) ? Number.parseInt(input) : input;
}
