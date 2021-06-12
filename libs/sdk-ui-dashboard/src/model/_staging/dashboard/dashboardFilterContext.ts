// (C) 2021 GoodData Corporation
import {
    IDashboard,
    IDateFilterConfig,
    IFilterContextDefinition,
    isTempFilterContext,
} from "@gooddata/sdk-backend-spi";
import { createDefaultFilterContext } from "../filterContext/defaultFilterContext";

/**
 * Given a dashboard, this function will inspect its filter context and always return an instance of IFilterContextDefinition to use.
 *
 * The filter context definition represents a filter context that may or may not be already persisted on the backend. As such, this is
 * ideal to represent all possible states:
 *
 * 1. Dashboard has a persisted filter context
 * 2. Dashboard has no persisted filter context, in which case a new, default context should be used
 * 3. Dashboard is being exported and uses a temporary filter context that may stored in a different persistence store and
 *    possibly in a different format - while holding the same information.
 *
 * TODO: it's worth considering whether the temp filter context should be rather hidden as an impl detail and not exposed via SPI.
 *
 * @param dashboard
 * @param dateFilterConfig
 */
export function dashboardFilterContextDefinition(
    dashboard: IDashboard,
    dateFilterConfig: IDateFilterConfig,
): IFilterContextDefinition {
    const { filterContext } = dashboard;

    if (!filterContext) {
        return createDefaultFilterContext(dateFilterConfig);
    }

    if (isTempFilterContext(filterContext)) {
        return {
            title: "filterContext",
            description: "",
            filters: filterContext.filters,
        };
    }

    return filterContext;
}
