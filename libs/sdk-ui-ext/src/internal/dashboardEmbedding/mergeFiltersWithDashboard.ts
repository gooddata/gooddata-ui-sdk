// (C) 2020-2021 GoodData Corporation
import { IDashboard, FilterContextItem } from "@gooddata/sdk-backend-spi";
import { IDashboardFilter } from "./types";
import { filterArrayToFilterContextItems } from "./utils/filters";

/**
 * Gets filters merged with the filters provided by the specified dashboard.
 *
 * @param dashboard - dashboard to get the filters from
 * @param additionalFilters - filters to apply on top of the filters from the dashboard
 * @alpha
 */
export function mergeFiltersWithDashboard(
    dashboard: IDashboard,
    additionalFilters: Array<IDashboardFilter | FilterContextItem>,
): FilterContextItem[] {
    const sanitizedAdditionalFilters = filterArrayToFilterContextItems(additionalFilters);
    return [...dashboard.filterContext?.filters, ...sanitizedAdditionalFilters];
}
