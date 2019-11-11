// (C) 2019 GoodData Corporation
import omitBy from "lodash/omitBy";
import isUndefined from "lodash/isUndefined";
import { DashboardExport } from "./DashboardExport";
import isDateFilter = DashboardExport.isDateFilter;

function sanitizeDateFilter(filter: DashboardExport.IDateFilter): DashboardExport.IDateFilter {
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
 * @internal
 */
export function sanitizeDateFilters(
    filters: DashboardExport.FilterContextItem[],
): DashboardExport.FilterContextItem[] {
    return filters.map(
        (filter: DashboardExport.FilterContextItem): DashboardExport.FilterContextItem => {
            if (isDateFilter(filter)) {
                return sanitizeDateFilter(filter);
            }
            return filter;
        },
    );
}
