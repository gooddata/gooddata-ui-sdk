// (C) 2007-2022 GoodData Corporation
import {
    absoluteDateFilterValues,
    areObjRefsEqual,
    attributeElementsIsEmpty,
    filterAttributeElements,
    filterIsEmpty,
    filterObjRef,
    IFilter,
    isAllTimeDateFilter,
    isAttributeElementsByRef,
    isAttributeFilter,
    isDateFilter,
    isNegativeAttributeFilter,
    isRelativeDateFilter,
    relativeDateFilterValues,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    IWidgetAlertDefinition,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import last from "lodash/last.js";
import sortBy from "lodash/sortBy.js";

export function isKpiAlertDateFilterSameAsDashboard(
    alert: IWidgetAlertDefinition,
    appliedFilters: IFilter[],
): boolean {
    const alertDateFilter = alert?.filterContext?.filters.find(isDashboardDateFilter);
    const appliedDateFilter = last(appliedFilters.filter(isDateFilter));

    if (!alertDateFilter) {
        return !appliedDateFilter || isAllTimeDateFilter(appliedDateFilter);
    }

    if (!appliedDateFilter || isAllTimeDateFilter(appliedDateFilter)) {
        return false;
    }

    if (isRelativeDateFilter(appliedDateFilter)) {
        const { from, granularity, to } = relativeDateFilterValues(appliedDateFilter);
        const sameType = alertDateFilter.dateFilter.type === "relative";
        const sameFrom = alertDateFilter.dateFilter.from?.toString() === from.toString();
        const sameTo = alertDateFilter.dateFilter.to?.toString() === to.toString();
        const sameGranularity = alertDateFilter.dateFilter.granularity === granularity;
        return [sameType, sameFrom, sameTo, sameGranularity].every(Boolean);
    } else {
        const { from, to } = absoluteDateFilterValues(appliedDateFilter);
        const sameType = alertDateFilter.dateFilter.type === "absolute";
        const sameFrom = alertDateFilter.dateFilter.from === from;
        const sameTo = alertDateFilter.dateFilter.to === to;
        return [sameType, sameFrom, sameTo].every(Boolean);
    }
}

function areKpiAlertAttributeFiltersSameAsDashboard(
    alert: IWidgetAlertDefinition,
    appliedFilters: IFilter[],
): boolean {
    const alertAttributeFilters = alert.filterContext?.filters.filter(isDashboardAttributeFilter) ?? [];
    const appliedAttributeFilters = appliedFilters.filter(isAttributeFilter);

    // empty filter is modelled as negative filter with no elements
    const alertAttributeFiltersWithoutEmpty = alertAttributeFilters.filter(
        (filter) =>
            !(
                filter.attributeFilter.negativeSelection &&
                attributeElementsIsEmpty(filter.attributeFilter.attributeElements)
            ),
    );

    const appliedAttributeFiltersWithoutEmpty = appliedAttributeFilters.filter(
        (filter) => !(isNegativeAttributeFilter(filter) && filterIsEmpty(filter)),
    );

    // the filters are considered the same if the count of non-empty filters is matching
    // and every filter in alert has an equivalent in the applied filters
    return (
        appliedAttributeFiltersWithoutEmpty.length === alertAttributeFiltersWithoutEmpty.length &&
        appliedAttributeFiltersWithoutEmpty.every((filter) => {
            const displayForm = filterObjRef(filter);
            const found = alertAttributeFiltersWithoutEmpty.find((alertFilter) =>
                areObjRefsEqual(alertFilter.attributeFilter.displayForm, displayForm),
            );

            if (!found) {
                return false;
            }

            const negativeSelectionSame =
                found.attributeFilter.negativeSelection === isNegativeAttributeFilter(filter);

            const filterElements = filterAttributeElements(filter);

            const elementsSame =
                isAttributeElementsByRef(filterElements) && // TODO what about filters by value?
                isAttributeElementsByRef(found.attributeFilter.attributeElements) && // TODO what about filters by value?
                isEqual(sortBy(found.attributeFilter.attributeElements.uris), sortBy(filterElements.uris));

            return negativeSelectionSame && elementsSame;
        })
    );
}

export function areKpiAlertFiltersSameAsDashboard(
    alert: IWidgetAlertDefinition | undefined,
    appliedFilters: IFilter[],
): boolean {
    return (
        !!alert &&
        isKpiAlertDateFilterSameAsDashboard(alert, appliedFilters) &&
        areKpiAlertAttributeFiltersSameAsDashboard(alert, appliedFilters)
    );
}
