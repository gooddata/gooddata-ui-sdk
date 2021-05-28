// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../dashboardStore";
import invariant from "ts-invariant";
import { FilterContextItem, isDashboardDateFilter } from "@gooddata/sdk-backend-spi";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.filterContext,
);

/**
 * This selector returns dashboard's filter context. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @internal
 */
export const selectFilterContext = createSelector(selectSelf, (filterContextState) => {
    invariant(filterContextState.filterContext, "attempting to access uninitialized filter context state");

    return filterContextState.filterContext!;
});

/**
 * This selector returns dashboard's filter context filters. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @internal
 */
export const selectFilterContextFilters = createSelector(
    selectFilterContext,
    (filterContext): FilterContextItem[] => filterContext.filters,
);

/**
 * This selector returns dashboard's filter context filters with default date filter added if needed.
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @internal
 */
export const selectFilterContextFiltersWithDefaultDateFilter = createSelector(
    selectFilterContextFilters,
    (filters): FilterContextItem[] => {
        const hasDateFilter = filters.some((filter) => isDashboardDateFilter(filter));

        return hasDateFilter
            ? filters
            : [{ dateFilter: { granularity: "GDC.time.date", type: "relative" } }, ...filters];
    },
);
