// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { DashboardState } from "../types";
import { newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap";

import { accessibleDashboardsEntityAdapter } from "./accessibleDashboardsEntityAdapter";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.accessibleDashboards,
);

const adapterSelectors = accessibleDashboardsEntityAdapter.getSelectors(selectSelf);

/**
 * Select all accessible dashboard in project.
 *
 * @alpha
 */
export const selectAccessibleDashboards = adapterSelectors.selectAll;

/**
 * Select all accessible dashboard in project and returns them in a mapping of obj ref to the insight object.
 *
 * @alpha
 */
export const selectAccessibleDashboardsMap = createSelector(selectAccessibleDashboards, (dashboards) => {
    return newMapForObjectWithIdentity(dashboards);
});
