// (C) 2021-2024 GoodData Corporation
import { type FilterContextItem, isDashboardCommonDateFilter } from "@gooddata/sdk-model";

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
    return filters.some(isDashboardCommonDateFilter) ? filters : [allTimeFilterContextItem, ...filters];
}
