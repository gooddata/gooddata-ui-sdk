// (C) 2025-2026 GoodData Corporation

import {
    type DashboardAttributeFilterItem,
    type FilterContextItem,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardFilterObjRef,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardMeasureValueFilter,
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

                  if (
                      isDashboardMeasureValueFilter(filter) &&
                      ignoredFilter.type === "measureValueFilterReference"
                  ) {
                      return areObjRefsEqual(ignoredFilter.measure, dashboardFilterObjRef(filter));
                  }

                  return false;
              }),
    );
}

/**
 * @internal
 */
export function getAttributeFilters(filters: FilterContextItem[]): DashboardAttributeFilterItem[] {
    return filters.filter(isDashboardAttributeFilterItem);
}
