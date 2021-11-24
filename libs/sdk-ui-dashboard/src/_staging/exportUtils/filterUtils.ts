// (C) 2021 GoodData Corporation
import { FilterContextItem, isDashboardDateFilter } from "@gooddata/sdk-backend-spi";

// the value is taken from gdc-dashboards
const allTimeFilterContextItem: FilterContextItem = {
    dateFilter: {
        type: "absolute",
        granularity: "GDC.time.year",
    },
};

export function ensureAllTimeFilterForExport(filters: FilterContextItem[]): FilterContextItem[] {
    // if there is no date filter, add an "all time" filter so that in case the dashboard is saved with some
    // date filter, it is overridden to All time for the purpose of the export
    return filters.some(isDashboardDateFilter) ? filters : [allTimeFilterContextItem, ...filters];
}
