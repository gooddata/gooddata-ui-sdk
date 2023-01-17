// (C) 2022-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.dashboardPermissions,
);

/**
 * This selector returns user's dashboard permissions.
 *
 * @remarks
 * It is expected that the selector is called only after the dashboard permission state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * If the permission is not supported by GoodData Cloud and GoodData.CN backends, the selector always returns `false` value.
 *
 * In case you need multiple permissions available in your application, use this common selector.
 *
 * @public
 */
export const selectDashboardPermissions = createSelector(selectSelf, (state) => {
    invariant(state.dashboardPermissions, "attempting to access uninitialized dashboard permissions state");

    return state.dashboardPermissions!;
});

/**
 * Returns whether the current user has permissions to view dashboard.
 *
 * @public
 */
export const selectCanViewDashboardPermission = createSelector(selectDashboardPermissions, (state) => {
    return state?.canViewDashboard ?? false;
});

/**
 * Returns whether the current user has permissions to share dashboard.
 *
 * @public
 */
export const selectCanShareDashboardPermission = createSelector(selectDashboardPermissions, (state) => {
    return state?.canShareDashboard ?? false;
});

/**
 * Returns whether the current user has permissions to edit dashboard.
 *
 * @public
 */
export const selectCanEditDashboardPermission = createSelector(selectDashboardPermissions, (state) => {
    return state?.canEditDashboard ?? false;
});
