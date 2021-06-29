// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { listedDashboardsEntityAdapter } from "./listedDashboardsEntityAdapter";
import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.listedDashboards,
);

const adapterSelectors = listedDashboardsEntityAdapter.getSelectors(selectSelf);

/**
 * Selects all alerts used on the dashboard.
 *
 * @internal
 */
export const selectListedDashboards = adapterSelectors.selectAll;
