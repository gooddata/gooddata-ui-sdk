// (C) 2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import invariant from "ts-invariant";
import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.legacyDashboards,
);

/**
 * Selects all the legacy dashboards. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectLegacyDashboards = createSelector(selectSelf, (state) => {
    invariant(state.legacyDashboards, "attempting to access uninitialized legacy dashboard state");

    return state.legacyDashboards;
});
