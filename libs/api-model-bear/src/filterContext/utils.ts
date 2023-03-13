// (C) 2019-2023 GoodData Corporation
import omitBy from "lodash/omitBy";
import isUndefined from "lodash/isUndefined";
import { GdcFilterContext } from "./GdcFilterContext";
import isDateFilter = GdcFilterContext.isDateFilter;
import isAttributeFilter = GdcFilterContext.isAttributeFilter;

function sanitizeDateFilter(filter: GdcFilterContext.IDateFilter): GdcFilterContext.IDateFilter {
    const {
        dateFilter: { from, to, type, granularity },
        dateFilter,
    } = filter;
    const sanitizedProperties = omitBy(dateFilter, isUndefined);

    return {
        dateFilter: {
            type,
            granularity,
            ...sanitizedProperties,
            ...(from === undefined ? {} : { from: String(from) }),
            ...(to === undefined ? {} : { to: String(to) }),
        },
    };
}

function sanitizeAttributeFilter(
    filter: GdcFilterContext.IAttributeFilter,
): GdcFilterContext.IAttributeFilter {
    const {
        attributeFilter: { displayForm, negativeSelection, attributeElements, selectionMode },
    } = filter;

    return {
        attributeFilter: {
            displayForm,
            negativeSelection,
            attributeElements,
            selectionMode,
        },
    };
}

/**
 * @public
 */
export function sanitizeFiltersForExport(
    filters: GdcFilterContext.FilterContextItem[],
): GdcFilterContext.FilterContextItem[] {
    return filters.map((filter: GdcFilterContext.FilterContextItem): GdcFilterContext.FilterContextItem => {
        if (isDateFilter(filter)) {
            return sanitizeDateFilter(filter);
        }
        if (isAttributeFilter(filter)) {
            return sanitizeAttributeFilter(filter);
        }
        return filter;
    });
}
