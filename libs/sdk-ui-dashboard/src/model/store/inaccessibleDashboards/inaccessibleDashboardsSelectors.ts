// (C) 2023-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { inaccessibleDashboardsEntityAdapter } from "./inaccessibleDashboardsEntityAdapter.js";
import { type ObjRefMap, newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap.js";
import { type IInaccessibleDashboard } from "../../types/inaccessibleDashboardTypes.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

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
