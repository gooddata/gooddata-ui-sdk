// (C) 2019 GoodData Corporation
import omitBy from "lodash/omitBy";
import isUndefined from "lodash/isUndefined";
import { GdcFilterContext } from "./GdcFilterContext";
import isDateFilter = GdcFilterContext.isDateFilter;

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

/**
 * @public
 */
export function sanitizeDateFilters(
    filters: GdcFilterContext.FilterContextItem[],
): GdcFilterContext.FilterContextItem[] {
    return filters.map(
        (filter: GdcFilterContext.FilterContextItem): GdcFilterContext.FilterContextItem => {
            if (isDateFilter(filter)) {
                return sanitizeDateFilter(filter);
            }
            return filter;
        },
    );
}
