// (C) 2024-2026 GoodData Corporation

import { isEqual, omit } from "lodash-es";

import {
    type DashboardTextAttributeFilter,
    type FilterContextItem,
    type IDashboard,
    type IDashboardArbitraryAttributeFilter,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardFilterView,
    type IFilterContext,
    type ISettings,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardAttributeFilterItemTitle,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    isDashboardMatchAttributeFilter,
    isDashboardTextAttributeFilter,
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

const findMatchingTextFilterByLocalIdentifier = (
    filter: DashboardTextAttributeFilter,
    viewFilters: FilterContextItem[],
): DashboardTextAttributeFilter | undefined => {
    const localId = dashboardAttributeFilterItemLocalIdentifier(filter);
    if (!localId) return undefined;
    return viewFilters.find(
        (item): item is DashboardTextAttributeFilter =>
            isDashboardTextAttributeFilter(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === localId,
    );
};

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

/**
 * Checks that the non-view-editable configuration of two text filters matches.
 * Only displayForm and title are compared — everything changeable in view mode
 * (type, values, operator, literal, caseSensitive, negativeSelection) is ignored.
 */
const hasSameTextFilterConfiguration = (
    filterA: DashboardTextAttributeFilter,
    filterB: DashboardTextAttributeFilter,
) => {
    return (
        areObjRefsEqual(
            dashboardAttributeFilterItemDisplayForm(filterA),
            dashboardAttributeFilterItemDisplayForm(filterB),
        ) && dashboardAttributeFilterItemTitle(filterA) === dashboardAttributeFilterItemTitle(filterB)
    );
};

/** Creates "All" state for text filters: always a negative arbitrary filter with empty selection */
const createResetTextFilter = (filter: DashboardTextAttributeFilter): IDashboardArbitraryAttributeFilter => {
    const displayForm = dashboardAttributeFilterItemDisplayForm(filter);
    const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
    const title = dashboardAttributeFilterItemTitle(filter);
    if (isDashboardArbitraryAttributeFilter(filter)) {
        const { filterElementsBy, filterElementsByDate, validateElementsBy } =
            filter.arbitraryAttributeFilter;
        return {
            arbitraryAttributeFilter: {
                displayForm,
                values: [],
                negativeSelection: true,
                localIdentifier,
                title,
                filterElementsBy,
                filterElementsByDate,
                validateElementsBy,
            },
        };
    }
    // Match filter - no validateElementsBy, filterElementsBy, or filterElementsByDate
    return {
        arbitraryAttributeFilter: {
            displayForm,
            values: [],
            negativeSelection: true,
            localIdentifier,
            title,
        },
    };
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

/**
 * Applies the view filter's type and values to the dashboard filter,
 * preserving the dashboard filter's config (title, filterElementsBy,
 * filterElementsByDate, validateElementsBy) and taking only selection
 * fields from the view. Handles type changes between arbitrary and match filters.
 */
const applyTextFilterFromView = (
    dashboardFilter: DashboardTextAttributeFilter,
    viewFilter: DashboardTextAttributeFilter,
): DashboardTextAttributeFilter => {
    const dashboardFilterTitle = dashboardAttributeFilterItemTitle(dashboardFilter);

    if (isDashboardArbitraryAttributeFilter(viewFilter)) {
        const dashboardArbitrary = isDashboardArbitraryAttributeFilter(dashboardFilter)
            ? dashboardFilter.arbitraryAttributeFilter
            : undefined;
        return {
            arbitraryAttributeFilter: {
                ...viewFilter.arbitraryAttributeFilter,
                title: dashboardFilterTitle,
                filterElementsBy: dashboardArbitrary?.filterElementsBy,
                filterElementsByDate: dashboardArbitrary?.filterElementsByDate,
                validateElementsBy: dashboardArbitrary?.validateElementsBy,
            },
        };
    }
    if (isDashboardMatchAttributeFilter(viewFilter)) {
        return {
            matchAttributeFilter: {
                ...viewFilter.matchAttributeFilter,
                title: dashboardFilterTitle,
            },
        };
    }
    return viewFilter;
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
        } else if (isDashboardDateFilter(filter)) {
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
        } else if (isDashboardTextAttributeFilter(filter)) {
            const viewFilter = findMatchingTextFilterByLocalIdentifier(filter, filterViewFilters);
            if (viewFilter !== undefined && hasSameTextFilterConfiguration(filter, viewFilter)) {
                return applyTextFilterFromView(filter, viewFilter);
            }
            // reset text filter that has not been found or has different configuration
            return createResetTextFilter(filter);
        } else {
            return filter;
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
    const areFilterViewsEnabled = settings.enableDashboardFilterViews;

    if (!areFilterViewsEnabled) {
        return dashboard;
    }

    // If dashboard has tabs, apply default views per tab
    if (dashboard.tabs && dashboard.tabs.length > 0) {
        // Find legacy global default view (without tabLocalIdentifier) as fallback for first tab
        const legacyDefaultView = filterViews.find((view) => view.isDefault && !view.tabLocalIdentifier);

        const updatedTabs = dashboard.tabs.map((tab, index) => {
            // Find default view specific to this tab
            const tabDefaultView = filterViews.find(
                (view) => view.isDefault && view.tabLocalIdentifier === tab.localIdentifier,
            );

            // Use tab-specific default, or fall back to legacy global default only for the first tab
            const isFirstTab = index === 0;
            const effectiveDefaultView = tabDefaultView ?? (isFirstTab ? legacyDefaultView : undefined);

            if (effectiveDefaultView && tab.filterContext && isFilterContext(tab.filterContext)) {
                return {
                    ...tab,
                    filterContext: changeFilterContextSelection(
                        tab.filterContext,
                        effectiveDefaultView.filterContext.filters,
                    ),
                };
            }

            return tab;
        });

        return {
            ...dashboard,
            tabs: updatedTabs,
        };
    }

    // Legacy behavior: apply default view to root-level filter context
    const defaultFilterView = filterViews.find((view) => view.isDefault);

    return defaultFilterView && isFilterContext(dashboard.filterContext)
        ? {
              ...dashboard,
              filterContext: changeFilterContextSelection(
                  dashboard.filterContext,
                  defaultFilterView.filterContext.filters,
              ),
          }
        : dashboard;
}
