// (C) 2025-2026 GoodData Corporation

import {
    type FilterContextItem,
    type IDashboardAttributeFilter,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isInsightWidget,
} from "@gooddata/sdk-model";

import { type ExtendedDashboardWidget } from "../types/layoutTypes.js";

/**
 * @internal
 */
export function removeIgnoredWidgetFilters(
    filters: FilterContextItem[],
    widget: ExtendedDashboardWidget | undefined,
) {
    if (!isInsightWidget(widget)) {
        return filters;
    }

    return filters.filter((filter) =>
        isDashboardCommonDateFilter(filter)
            ? !!widget.dateDataSet
            : !widget.ignoreDashboardFilters.some((ignoredFilter) => {
                  if (isDashboardDateFilter(filter) && ignoredFilter.type === "dateFilterReference") {
                      return areObjRefsEqual(ignoredFilter.dataSet, filter.dateFilter.dataSet);
                  }

                  if (
                      isDashboardAttributeFilterItem(filter) &&
                      ignoredFilter.type === "attributeFilterReference"
                  ) {
                      return areObjRefsEqual(
                          ignoredFilter.displayForm,
                          dashboardAttributeFilterItemDisplayForm(filter),
                      );
                  }

                  return false;
              }),
    );
}

/**
 * @internal
 */
export function removeDateFilters(filters: FilterContextItem[]): IDashboardAttributeFilter[] {
    return filters.filter(isDashboardAttributeFilter);
}
