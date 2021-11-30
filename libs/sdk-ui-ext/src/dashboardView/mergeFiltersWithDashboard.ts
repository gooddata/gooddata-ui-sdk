// (C) 2019-2021 GoodData Corporation
import { FilterContextItem, IDashboard } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, filterObjRef, ObjRef, IFilter, isDateFilter } from "@gooddata/sdk-model";
import { IDashboardFilter } from "./types";
import { filterArrayToFilterContextItems } from "../internal";

/**
 * Gets filters merged with the filters provided by the specified dashboard.
 *
 * @param dashboard - dashboard to get the filters from
 * @param additionalFilters - filters to apply on top of the filters from the dashboard
 * @beta
 * @deprecated superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export function mergeFiltersWithDashboard(
    dashboard: IDashboard | undefined,
    additionalFilters: Array<IDashboardFilter | FilterContextItem>,
): FilterContextItem[] {
    const sanitizedAdditionalFilters = filterArrayToFilterContextItems(additionalFilters ?? []);
    return [...(dashboard?.filterContext?.filters ?? []), ...sanitizedAdditionalFilters];
}

export function hasDateFilterForDateDataset(filters: IFilter[], dateDataset: ObjRef): boolean {
    return filters.some((filter) => {
        if (!isDateFilter(filter)) {
            return false;
        }

        return areObjRefsEqual(filterObjRef(filter), dateDataset);
    });
}
