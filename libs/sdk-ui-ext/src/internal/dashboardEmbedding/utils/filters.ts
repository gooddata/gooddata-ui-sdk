// (C) 2019-2021 GoodData Corporation
import {
    NotSupported,
    FilterContextItem,
    isDateFilterGranularity,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterReference,
    isDashboardDateFilter,
    isDashboardDateFilterReference,
    IWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    areObjRefsEqual,
    isAbsoluteDateFilter,
    isRelativeDateFilter,
    isNegativeAttributeFilter,
    isAttributeElementsByRef,
    filterAttributeElements,
    filterObjRef,
    isAttributeFilter,
    ObjRef,
    IFilter,
    isDateFilter,
} from "@gooddata/sdk-model";
import { IDashboardFilter } from "../types";

/**
 * Converts a {@link IDashboardFilter} to a {@link FilterContextItem}.
 * @param filter - filter to convert
 */
export function dashboardFilterToFilterContextItem(filter: IDashboardFilter): FilterContextItem {
    if (isAttributeFilter(filter)) {
        const attributeElements = filterAttributeElements(filter);
        if (!isAttributeElementsByRef(attributeElements)) {
            // For attributes with a lot of elements, this transformation can be very expensive.
            // Let's enforce user to provide element uris by himself.
            throw new NotSupported(
                "Attribute filter with text values is not supported. Please provide element uris instead.",
            );
        }
        return {
            attributeFilter: {
                negativeSelection: isNegativeAttributeFilter(filter),
                displayForm: filterObjRef(filter),
                attributeElements,
            },
        };
    } else if (isAbsoluteDateFilter(filter)) {
        return {
            dateFilter: {
                type: "absolute",
                granularity: "GDC.time.date",
                from: filter.absoluteDateFilter.from,
                to: filter.absoluteDateFilter.to,
                dataSet: filter.absoluteDateFilter.dataSet,
            },
        };
    } else if (isRelativeDateFilter(filter)) {
        if (!isDateFilterGranularity(filter.relativeDateFilter.granularity)) {
            // Only a subset of granularity can be stored in the filter context.
            throw new NotSupported(
                "Unsupported date filter granularity! Please provide valid date filter granularity. (Check DateFilterGranularity type)",
            );
        }
        return {
            dateFilter: {
                type: "relative",
                granularity: filter.relativeDateFilter.granularity,
                from: filter.relativeDateFilter.from,
                to: filter.relativeDateFilter.to,
                dataSet: filter.relativeDateFilter.dataSet,
            },
        };
    }

    throw new NotSupported("Unsupported filter type! Please provide valid dashboard filter.");
}

/**
 * Remove information about the date dataset from Date filters. Attribute filters are returned unchanged.
 * @param filter - filter to strip date dataset from
 */
export function stripDateDatasets(filter: FilterContextItem): FilterContextItem {
    if (!isDashboardDateFilter(filter)) {
        return filter;
    }

    const { dataSet: _, ...rest } = filter.dateFilter;
    return {
        dateFilter: rest,
    };
}

export function filterArrayToFilterContextItems(
    filters: Array<IDashboardFilter | FilterContextItem>,
): FilterContextItem[] {
    return filters.map((filter) => {
        if (isDashboardDateFilter(filter) || isDashboardAttributeFilter(filter)) {
            return filter;
        } else {
            return dashboardFilterToFilterContextItem(filter);
        }
    });
}

export function isAttributeFilterIgnored(widget: IWidgetDefinition, displayForm: ObjRef): boolean {
    return widget.ignoreDashboardFilters.some(
        (filter) =>
            isDashboardAttributeFilterReference(filter) && areObjRefsEqual(filter.displayForm, displayForm),
    );
}

export function isDateFilterIgnored(widget: IWidgetDefinition, displayForm: ObjRef): boolean {
    return widget.ignoreDashboardFilters.some(
        (filter) => isDashboardDateFilterReference(filter) && areObjRefsEqual(filter.dataSet, displayForm),
    );
}

export function isDateFilterIrrelevant(widget: IWidgetDefinition): boolean {
    const dateDataSetRef = widget.dateDataSet;
    // backward compatibility for old kpis
    const ignoredOldWay = isDateFilterIgnored(widget, dateDataSetRef);
    // now dataSetRef is cleaned
    const checkboxEnabled = !!dateDataSetRef;
    return !checkboxEnabled || ignoredOldWay;
}

export function hasDateFilterForDateDataset(filters: IFilter[], dateDataset: ObjRef): boolean {
    return filters.some((filter) => {
        if (!isDateFilter(filter)) {
            return false;
        }

        return areObjRefsEqual(filterObjRef(filter), dateDataset);
    });
}
