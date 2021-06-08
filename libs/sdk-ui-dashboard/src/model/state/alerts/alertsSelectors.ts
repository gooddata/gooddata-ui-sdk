// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { alertsAdapter } from "./alertsEntityAdapter";
import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.alerts,
);

const adapterSelectors = alertsAdapter.getSelectors(selectSelf);

/**
 * Selects all alerts used on the dashboard.
 *
 * @internal
 */
export const selectAlerts = adapterSelectors.selectAll;
