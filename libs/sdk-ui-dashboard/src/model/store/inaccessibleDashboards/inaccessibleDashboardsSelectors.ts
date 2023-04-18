// (C) 2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { IInaccessibleDashboard } from "../../types/inaccessibleDashboardTypes";
import { DashboardSelector, DashboardState } from "../types";
import { ObjRefMap, newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap";

import { inaccessibleDashboardsEntityAdapter } from "./inaccessibleDashboardsEntityAdapter";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.inaccessibleDashboards,
);

const adapterSelectors = inaccessibleDashboardsEntityAdapter.getSelectors(selectSelf);

/**
 * Select all inaccessible dashboard in project.
 *
 * @alpha
 */
export const selectInaccessibleDashboards = adapterSelectors.selectAll;

/**
 * Select all inaccessible dashboard in project and returns them in a mapping of obj ref to the insight object.
 *
 * @alpha
 */
export const selectInaccessibleDashboardsMap: DashboardSelector<ObjRefMap<IInaccessibleDashboard>> =
    createSelector(selectInaccessibleDashboards, (dashboards) => {
        return newMapForObjectWithIdentity(dashboards);
    });
