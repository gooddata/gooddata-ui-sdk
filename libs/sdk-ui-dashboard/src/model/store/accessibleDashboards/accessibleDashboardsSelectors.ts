// (C) 2021-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { type IListedDashboard } from "@gooddata/sdk-model";

import { accessibleDashboardsEntityAdapter } from "./accessibleDashboardsEntityAdapter.js";
import { type ObjRefMap, newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

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
 * Select if accessible dashboards were loaded
 *
 * @alpha
 */
export const selectAccessibleDashboardsLoaded: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (dashboards) => dashboards.isLoaded,
);

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
