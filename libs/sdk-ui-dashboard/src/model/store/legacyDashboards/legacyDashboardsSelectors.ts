// (C) 2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.legacyDashboards,
);

/**
 * Selects all the legacy dashboards. Will return undefined if the dashboards have not been loaded yet.
 * @alpha
 */
export const selectLegacyDashboards = createSelector(selectSelf, (state) => {
    return state.legacyDashboards;
});
