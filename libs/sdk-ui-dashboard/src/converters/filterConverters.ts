// (C) 2020-2021 GoodData Corporation
import {
    FilterContextItem,
    IDashboardAttributeFilter,
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
} from "@gooddata/sdk-model";
import isString from "lodash/isString";
import { IDashboardFilter } from "../types";

/**
 * Gets {@link IDashboardFilter} items for filters specified in given filterContext in relation to the given widget.
 *
 * @param filterContext - filter context to get filters for
 * @param widget - widget to use to get dateDataSet for date filters
 * @internal
 */
export function filterContextToFiltersForWidget(
    filterContext: IFilterContextDefinition | IFilterContext | ITempFilterContext | undefined,
    widget: IWidgetDefinition,
): IDashboardFilter[] {
    if (!filterContext) {
        return [];
    }

    return filterContextItemsToFiltersForWidget(filterContext.filters, widget);
}

/**
 * Converts {@link IDashboardAttributeFilter} to {@link @gooddata/sdk-model#IAttributeFilter} instance.
 *
 * @param filter - filter context attribute filter to convert
 * @internal
 */
export function filterContextAttributeFilterToAttributeFilter(
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
 * Gets {@link IDashboardFilter} items for filters specified as {@link @gooddata/sdk-backend-spi#FilterContextItem} instances.
 *
 * @param filterContextItems - filter context items to get filters for
 * @param widget - widget to use to get dateDataSet for date filters
 * @internal
 */
export function filterContextItemsToFiltersForWidget(
    filterContextItems: FilterContextItem[],
    widget: IWidgetDefinition,
): IDashboardFilter[] {
    return filterContextItems.map((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            return filterContextAttributeFilterToAttributeFilter(filter);
        } else {
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
    });
}

function numberOrStringToNumber(input: number | string): number {
    return isString(input) ? Number.parseInt(input) : input;
}
