// (C) 2021-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { type IListedDashboard } from "@gooddata/sdk-model";

import { listedDashboardsEntityAdapter } from "./listedDashboardsEntityAdapter.js";
import { type ObjRefMap, newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

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
export const selectListedDashboardsMap: DashboardSelector<ObjRefMap<IListedDashboard>> = createSelector(
    selectListedDashboards,
    (dashboards) => {
        return newMapForObjectWithIdentity(dashboards);
    },
);
