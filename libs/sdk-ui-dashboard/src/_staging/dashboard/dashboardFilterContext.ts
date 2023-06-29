// (C) 2021-2022 GoodData Corporation
import {
    IDateFilterConfig,
    IDashboardObjectIdentity,
    IFilterContextDefinition,
    isDashboardAttributeFilter,
    isTempFilterContext,
    IDashboard,
} from "@gooddata/sdk-model";
import { createDefaultFilterContext } from "./defaultFilterContext.js";

/**
 * Given a dashboard, this function will inspect its filter context and always return a valid instance of IFilterContextDefinition to use.
 *
 * The filter context definition represents a filter context that may or may not be already persisted on the backend. As such, this is
 * ideal to represent all possible states:
 *
 * 1. Dashboard has a persisted filter context
 * 2. Dashboard has no persisted filter context, in which case a new, default context should be used
 * 3. Dashboard is being exported and uses a temporary filter context that may stored in a different persistence store and
 *    possibly in a different format - while holding the same information.
 *
 * The filter context will be validated and sanitized so that any bad items (that may be added through rest API without validation)
 * will be removed.
 *
 * TODO: it's worth considering whether the temp filter context should be rather hidden as an impl detail and not exposed via SPI.
 *
 * @param dashboard - dashboard to get filter context from
 * @param dateFilterConfig - date filter config to use in case default filter context has to be created
 */
export function dashboardFilterContextDefinition<TWidget>(
    dashboard: IDashboard<TWidget>,
    dateFilterConfig: IDateFilterConfig,
): IFilterContextDefinition {
    const { filterContext } = dashboard;

    if (!filterContext) {
        return createDefaultFilterContext(dateFilterConfig, !dashboard.ref);
    }

    if (isTempFilterContext(filterContext)) {
        // Temp filter context is not sanitized.. not sure why, but this is how KD was doing it.
        return {
            title: "filterContext",
            description: "",
            filters: filterContext.filters,
        };
    }

    const result = {
        ...dashboardFilterContextSanitize(filterContext),
    };
    delete result.ref;
    delete result.uri;
    delete result.identifier;

    return result;
}

/**
 * Given a dashboard, this function will return identity information about the filter context used by the dashboard.
 *
 * If the dashboard has no filter context or a temporary filter context (used during exports) the identity
 * will be undefined. This should be indication to the caller that whatever the filter context the dashboard
 * is working with is not persisted.
 *
 * @param dashboard - dashboard to get filter context from.
 */
export function dashboardFilterContextIdentity<TWidget>(
    dashboard: IDashboard<TWidget>,
): IDashboardObjectIdentity | undefined {
    const { filterContext } = dashboard;

    if (!filterContext || isTempFilterContext(filterContext) || !filterContext.ref) {
        return undefined;
    }

    return {
        ref: filterContext.ref,
        uri: filterContext.uri,
        identifier: filterContext.identifier,
    };
}

/**
 * This function will sanitize the filter context and remove invalid entries:
 *
 * 1.  Attribute filters that are setup with parent filters, but those parent filters do not exist in the contex.
 */
export function dashboardFilterContextSanitize(
    filterContext: IFilterContextDefinition,
): IFilterContextDefinition {
    const filters = filterContext.filters;
    const filterLocalIdentifiers = filters
        .filter(isDashboardAttributeFilter)
        .map((filter) => filter.attributeFilter.localIdentifier);

    const sanitizedFilters = filters.map((filter) => {
        if (!isDashboardAttributeFilter(filter) || !filter.attributeFilter.filterElementsBy) {
            return filter;
        }
        const sanitizedFilterElementsBy = filter.attributeFilter.filterElementsBy.filter(
            (filterElementsBy) =>
                filterLocalIdentifiers.indexOf(filterElementsBy.filterLocalIdentifier) !== -1,
        );
        return {
            attributeFilter: {
                ...filter.attributeFilter,
                filterElementsBy: sanitizedFilterElementsBy,
            },
        };
    });

    return {
        ...filterContext,
        filters: sanitizedFilters,
    };
}
