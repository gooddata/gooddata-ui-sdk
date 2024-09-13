// (C) 2024 GoodData Corporation

import {
    IDashboard,
    IDashboardFilterView,
    isFilterContext,
    ISettings,
    isDashboardAttributeFilter,
    IDashboardAttributeFilter,
    FilterContextItem,
    IDashboardDateFilter,
    isDashboardDateFilter,
    areObjRefsEqual,
    IFilterContext,
} from "@gooddata/sdk-model";
import omit from "lodash/omit.js";
import isEqual from "lodash/isEqual.js";

const findMatchingAttributeFilterByLocalIdentifier = (
    filter: IDashboardAttributeFilter,
    viewFilters: FilterContextItem[],
): IDashboardAttributeFilter | undefined =>
    viewFilters.find(
        (item) =>
            isDashboardAttributeFilter(item) &&
            item.attributeFilter.localIdentifier === filter.attributeFilter.localIdentifier,
    ) as IDashboardAttributeFilter;

// date filters do not have localIdentifier set, compare them by dataSet instead
const findMatchingDateFilterByDataSet = (
    filter: IDashboardDateFilter,
    viewFilters: FilterContextItem[],
): IDashboardDateFilter | undefined =>
    viewFilters.find(
        (item) =>
            isDashboardDateFilter(item) &&
            ((item.dateFilter.dataSet === undefined && filter.dateFilter.dataSet === undefined) ||
                areObjRefsEqual(item.dateFilter.dataSet, filter.dateFilter.dataSet)),
    ) as IDashboardDateFilter;

const OMITTED_ATTRIBUTE_FILTER_PATHS = [
    "attributeFilter.attributeElements",
    "attributeFilter.negativeSelection",
];

const hasSameAttributeFilterConfiguration = (
    filterA: IDashboardAttributeFilter,
    filterB?: IDashboardAttributeFilter,
) => {
    return isEqual(
        omit(filterA, OMITTED_ATTRIBUTE_FILTER_PATHS),
        omit(filterB, OMITTED_ATTRIBUTE_FILTER_PATHS),
    );
};

export const changeFilterContextSelection = (
    filterContext: IFilterContext,
    filterViewFilters: FilterContextItem[],
): IFilterContext => {
    return {
        ...filterContext,
        filters: filterContext.filters.map((filter) => {
            if (isDashboardAttributeFilter(filter)) {
                const viewFilter = findMatchingAttributeFilterByLocalIdentifier(filter, filterViewFilters);
                if (viewFilter !== undefined && hasSameAttributeFilterConfiguration(filter, viewFilter)) {
                    return {
                        attributeFilter: {
                            ...filter.attributeFilter,
                            attributeElements: viewFilter.attributeFilter.attributeElements,
                            negativeSelection: viewFilter.attributeFilter.negativeSelection,
                        },
                    };
                }
            } else {
                const viewFilter = findMatchingDateFilterByDataSet(filter, filterViewFilters);
                if (viewFilter) {
                    return {
                        dateFilter: {
                            ...filter.dateFilter,
                            from: viewFilter.dateFilter.from,
                            to: viewFilter.dateFilter.to,
                            granularity: viewFilter.dateFilter.granularity,
                            type: viewFilter.dateFilter.type,
                        },
                    };
                }
            }
            return filter;
        }),
    };
};

export function applyDefaultFilterView(
    dashboard: IDashboard,
    filterViews: IDashboardFilterView[],
    settings: ISettings,
): IDashboard {
    // find first default filter view (in case metadata are not consistent and there are more than one)
    const defaultFilterView = filterViews.find((view) => view.isDefault);
    const areFilterViewsEnabled = settings.enableDashboardFilterViews;

    return areFilterViewsEnabled && defaultFilterView && isFilterContext(dashboard.filterContext)
        ? {
              ...dashboard,
              filterContext: changeFilterContextSelection(
                  dashboard.filterContext,
                  defaultFilterView.filterContext.filters,
              ),
          }
        : dashboard;
}
