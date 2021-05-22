// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../dashboardStore";
import invariant from "ts-invariant";

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
export const filterContextSelector = createSelector(selectSelf, (filterContextState) => {
    invariant(filterContextState.filterContext, "attempting to access uninitialized filter context state");

    return filterContextState.filterContext!;
});
