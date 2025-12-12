// (C) 2025 GoodData Corporation

import {
    type FilterContextItem,
    type IDashboardAttributeFilter,
    areObjRefsEqual,
    isDashboardAttributeFilter,
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
                      isDashboardAttributeFilter(filter) &&
                      ignoredFilter.type === "attributeFilterReference"
                  ) {
                      return areObjRefsEqual(ignoredFilter.displayForm, filter.attributeFilter.displayForm);
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
