// (C) 2019 GoodData Corporation
import omitBy from "lodash/omitBy";
import isUndefined from "lodash/isUndefined";
import { GdcDashboardExport } from "./GdcDashboardExport";
import isDateFilter = GdcDashboardExport.isDateFilter;

function sanitizeDateFilter(filter: GdcDashboardExport.IDateFilter): GdcDashboardExport.IDateFilter {
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
    filters: GdcDashboardExport.FilterContextItem[],
): GdcDashboardExport.FilterContextItem[] {
    return filters.map(
        (filter: GdcDashboardExport.FilterContextItem): GdcDashboardExport.FilterContextItem => {
            if (isDateFilter(filter)) {
                return sanitizeDateFilter(filter);
            }
            return filter;
        },
    );
}
