// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { listedDashboardsEntityAdapter } from "./listedDashboardsEntityAdapter";
import { DashboardState } from "../types";
import { newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.listedDashboards,
);

const adapterSelectors = listedDashboardsEntityAdapter.getSelectors(selectSelf);

/**
 * Select all listed dashboard in project.
 *
 * @alpha
 */
export const selectListedDashboards = adapterSelectors.selectAll;

/**
 * Select all listed dashboard in project and returns them in a mapping of obj ref to the insight object.
 *
 * @alpha
 */
export const selectListedDashboardsMap = createSelector(selectListedDashboards, (dashboards) => {
    return newMapForObjectWithIdentity(dashboards);
});
