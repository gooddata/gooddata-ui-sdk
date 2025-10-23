// (C) 2025 GoodData Corporation

import {
    FilterContextItem,
    IDashboardAttributeFilter,
    areObjRefsEqual,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isInsightWidget,
} from "@gooddata/sdk-model";

import { ExtendedDashboardWidget } from "../model/index.js";

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

export function removeDateFilters(filters: FilterContextItem[]): IDashboardAttributeFilter[] {
    return filters.filter(isDashboardAttributeFilter);
}
