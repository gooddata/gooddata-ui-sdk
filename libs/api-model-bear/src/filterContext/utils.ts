// (C) 2019-2023 GoodData Corporation
import omitBy from "lodash/omitBy.js";
import isUndefined from "lodash/isUndefined.js";
import {
    FilterContextItem,
    IFilterContextAttributeFilter,
    IFilterContextDateFilter,
    isFilterContextAttributeFilter,
    isFilterContextDateFilter,
} from "./GdcFilterContext.js";

function sanitizeDateFilter(filter: IFilterContextDateFilter): IFilterContextDateFilter {
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

function sanitizeAttributeFilter(filter: IFilterContextAttributeFilter): IFilterContextAttributeFilter {
    const {
        attributeFilter: { displayForm, negativeSelection, attributeElements },
    } = filter;

    return {
        attributeFilter: {
            displayForm,
            negativeSelection,
            attributeElements,
        },
    };
}

/**
 * @public
 */
export function sanitizeFiltersForExport(filters: FilterContextItem[]): FilterContextItem[] {
    return filters.map((filter: FilterContextItem): FilterContextItem => {
        if (isFilterContextDateFilter(filter)) {
            return sanitizeDateFilter(filter);
        }
        if (isFilterContextAttributeFilter(filter)) {
            return sanitizeAttributeFilter(filter);
        }
        return filter;
    });
}
