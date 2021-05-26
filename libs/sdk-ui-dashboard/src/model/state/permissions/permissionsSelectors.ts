// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../dashboardStore";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.permissions,
);

/**
 * This selector returns user's permissions in the workspace where the dashboard is stored. It is expected that the
 * selector is called only after the permission state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @internal
 */
export const permissionsSelector = createSelector(selectSelf, (filterContextState) => {
    invariant(filterContextState.permissions, "attempting to access uninitialized permissions state");

    return filterContextState.permissions!;
});
