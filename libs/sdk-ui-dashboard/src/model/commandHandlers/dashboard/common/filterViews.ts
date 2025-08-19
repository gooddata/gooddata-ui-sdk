// (C) 2024-2025 GoodData Corporation

import isEqual from "lodash/isEqual.js";
import omit from "lodash/omit.js";

import {
    FilterContextItem,
    IDashboard,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IDashboardFilterView,
    IFilterContext,
    ISettings,
    areObjRefsEqual,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    isFilterContext,
} from "@gooddata/sdk-model";

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

const isCommonDateFilter = (filter: FilterContextItem) =>
    isDashboardDateFilter(filter) && filter.dateFilter.dataSet === undefined;

const handleCommonDateFilter = (
    filterContextFilters: FilterContextItem[],
    filterViewFilters: FilterContextItem[],
    mergedFilters: FilterContextItem[],
): FilterContextItem[] => {
    // If common date is set to All, it is not included in filter context filters.
    // Common filter differs from date filters by not having date dataset (it is provided by widget).
    const isCommonDateOriginallyOnAll = !filterContextFilters.some(isCommonDateFilter);
    const nonAllCommonDateFilterFromView = filterViewFilters.find(isCommonDateFilter);

    if (isCommonDateOriginallyOnAll && nonAllCommonDateFilterFromView) {
        // inject value of common date from view to filter context to override filter context's All value
        return [nonAllCommonDateFilterFromView, ...mergedFilters];
    } else if (!nonAllCommonDateFilterFromView) {
        // set common date to All based on filter view
        return mergedFilters.filter((filter) => !isCommonDateFilter(filter));
    }

    return mergedFilters;
};

export const changeFilterContextSelection = (
    filterContext: IFilterContext,
    filterViewFilters: FilterContextItem[],
): IFilterContext => {
    const mergedFilters: FilterContextItem[] = filterContext.filters.map((filter) => {
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
            } else {
                return {
                    // reset filter that has not been found in the view
                    attributeFilter: {
                        ...filter.attributeFilter,
                        attributeElements: {
                            uris: [],
                        },
                        negativeSelection: true,
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
            } else {
                return {
                    // reset filter that has not been found in the view
                    dateFilter: {
                        ...filter.dateFilter,
                        from: undefined,
                        to: undefined,
                        granularity: "GDC.time.date",
                        type: "relative",
                    },
                };
            }
        }
    });

    return {
        ...filterContext,
        filters: handleCommonDateFilter(filterContext.filters, filterViewFilters, mergedFilters),
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
