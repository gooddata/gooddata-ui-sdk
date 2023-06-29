// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { IListedDashboard } from "@gooddata/sdk-model";

import { DashboardSelector, DashboardState } from "../types.js";
import { ObjRefMap, newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap.js";

import { accessibleDashboardsEntityAdapter } from "./accessibleDashboardsEntityAdapter.js";

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
export const selectAccessibleDashboardsMap: DashboardSelector<ObjRefMap<IListedDashboard>> = createSelector(
    selectAccessibleDashboards,
    (dashboards) => {
        return newMapForObjectWithIdentity(dashboards);
    },
);
