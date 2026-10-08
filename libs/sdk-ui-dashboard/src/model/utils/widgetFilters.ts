// (C) 2025-2026 GoodData Corporation

import {
    type DashboardAttributeFilterItem,
    type FilterContextItem,
    type IAttributeFilter,
    type IDateFilter,
    type IFilter,
    type IMeasureValueFilter,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardFilterObjRef,
    filterLocalIdentifier,
    filterObjRef,
    isAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardAttributeFilterReference,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardDateFilterReference,
    isDashboardMeasureValueFilter,
    isDashboardMeasureValueFilterReference,
    isDateFilter,
    isInsightWidget,
    isMeasureValueFilter,
    isRankingFilter,
} from "@gooddata/sdk-model";

import { type ExtendedDashboardWidget, type FilterableDashboardWidget } from "../types/layoutTypes.js";

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

/**
 * A date filter with the date dataset it filters.
 *
 * @internal
 */
export interface IFilterDateDatasetPair {
    filter: IDateFilter;
    dateDatasetLink: ObjRef | undefined;
}

/**
 * Pairs date filters with the date datasets they filter.
 *
 * @internal
 */
export function selectDateDatasetsForDateFilters(filters: IDateFilter[]): IFilterDateDatasetPair[] {
    return filters.map((filter): IFilterDateDatasetPair => {
        return {
            dateDatasetLink: filterObjRef(filter),
            filter,
        };
    });
}

// the dashboard attribute filters the widget does not ignore, by primary display form or by display-as label
function resolveWidgetFilterIgnore(
    widget: FilterableDashboardWidget,
    dashboardNonDateFilters: IAttributeFilter[],
    displayAsLabelMap: Map<string, ObjRef>,
): IAttributeFilter[] {
    return dashboardNonDateFilters.filter((filter) => {
        const filterDisplayForm = filterObjRef(filter);
        const matches =
            filterDisplayForm &&
            widget.ignoreDashboardFilters?.filter(isDashboardAttributeFilterReference).some((ignored) => {
                const filterLocalId = filterLocalIdentifier(filter);
                const displayAsLabel = filterLocalId ? displayAsLabelMap.get(filterLocalId) : undefined;
                // The filter definition already carries the refs needed to decide the ignore:
                // its primary display form (filterObjRef) and its displayAsLabel. Comparing these
                // local refs directly avoids fetching the display form metadata object per widget
                // (getAttributeDisplayForms), which previously fired once per widget on every load.
                return (
                    areObjRefsEqual(ignored.displayForm, filterDisplayForm) ||
                    areObjRefsEqual(ignored.displayForm, displayAsLabel)
                );
            });

        return !matches;
    });
}

// the dashboard date filters the widget does not ignore, with their date datasets
function selectResolveWidgetDateFilterIgnore(
    widget: FilterableDashboardWidget,
    dashboardCommonDateFilters: IDateFilter[],
    dashboardDateFiltersWithDimensions: IDateFilter[],
): IFilterDateDatasetPair[] {
    const commonDateFilterDateDatasetPairs = selectDateDatasetsForDateFilters(dashboardCommonDateFilters);

    const widgetDateFilterDateDatasetPairs = selectDateDatasetsForDateFilters(
        dashboardDateFiltersWithDimensions,
    );
    return resolveWidgetDateFilterIgnore(
        widget,
        commonDateFilterDateDatasetPairs,
        widgetDateFilterDateDatasetPairs,
    );
}

function resolveWidgetDateFilterIgnore(
    widget: FilterableDashboardWidget,
    commonDateFilterDateDatasetPairs: IFilterDateDatasetPair[],
    widgetDateFilterDateDatasetPairs: IFilterDateDatasetPair[],
): IFilterDateDatasetPair[] {
    const nonIgnoredCommonDateFilterDateDatasetPairs = commonDateFilterDateDatasetPairs.filter(
        ({ dateDatasetLink }) => {
            return (
                !!widget.dateDataSet &&
                dateDatasetLink &&
                areObjRefsEqual(widget.dateDataSet, dateDatasetLink)
            );
        },
    );
    const nonIgnoredWidgetDateFilterDateDatasetPairs = widgetDateFilterDateDatasetPairs.filter(
        ({ dateDatasetLink }) => {
            const matches = widget.ignoreDashboardFilters
                ?.filter(isDashboardDateFilterReference)
                .some((ignored) => dateDatasetLink && areObjRefsEqual(ignored.dataSet, dateDatasetLink));

            return !matches;
        },
    );
    return [...nonIgnoredCommonDateFilterDateDatasetPairs, ...nonIgnoredWidgetDateFilterDateDatasetPairs];
}

// the dashboard measure value filters the widget does not ignore
function resolveDashboardMeasureValueFilters(
    widget: FilterableDashboardWidget,
    dashboardMeasureValueFilters: IMeasureValueFilter[],
): IMeasureValueFilter[] {
    const ignored = widget.ignoreDashboardFilters?.filter(isDashboardMeasureValueFilterReference) ?? [];
    if (ignored.length === 0) {
        return dashboardMeasureValueFilters;
    }
    return dashboardMeasureValueFilters.filter((filter) => {
        const measureRef = filter.measureValueFilter.measure;
        return !ignored.some((ref) => areObjRefsEqual(ref.measure, measureRef));
    });
}

/**
 * The dashboard filters a widget's execution applies, by kind.
 *
 * @internal
 */
export interface IWidgetDashboardFilters {
    dateFilters: IFilterDateDatasetPair[];
    attributeFilters: IAttributeFilter[];
    measureValueFilters: IMeasureValueFilter[];
}

/**
 * Resolves the dashboard filters a widget's execution applies.
 *
 * @remarks
 * Takes the widget-aware dashboard filters (its common date filters and its other filters, see
 * `selectAllFiltersForWidgetByRef`) and drops the ones the widget ignores. When the insight has a ranking
 * filter, the dashboard measure value filters are dropped too: the backend rejects executions that combine
 * them ("Measure value filters with ranking filters unsupported."), and AD prevents it in insights at
 * authoring time.
 *
 * @param widget - the widget to resolve the filters for
 * @param widgetAwareFilters - the widget's common date filters and its other dashboard filters
 * @param displayAsLabelMap - the display-as labels of the attribute filters, by filter local identifier
 * @param insightFilters - the filters of the insight the widget executes, if any
 *
 * @internal
 */
export function resolveWidgetDashboardFilters(
    widget: FilterableDashboardWidget,
    [commonDateFilters, otherFilters]: [IFilter[], IFilter[]],
    displayAsLabelMap: Map<string, ObjRef>,
    insightFilters: IFilter[] = [],
): IWidgetDashboardFilters {
    return {
        dateFilters: selectResolveWidgetDateFilterIgnore(
            widget,
            commonDateFilters.filter(isDateFilter),
            otherFilters.filter(isDateFilter),
        ),
        attributeFilters: resolveWidgetFilterIgnore(
            widget,
            otherFilters.filter(isAttributeFilter),
            displayAsLabelMap,
        ),
        measureValueFilters: insightFilters.some(isRankingFilter)
            ? []
            : resolveDashboardMeasureValueFilters(widget, otherFilters.filter(isMeasureValueFilter)),
    };
}
