// (C) 2022 GoodData Corporation
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
 * See {@link @gooddata/sdk-backend-model#DashboardPermission} for all available permissions.
 *
 * If the permission is not supported by GoodData Cloud and GoodData.CN backends, the selector always returns `false` value.
 *
 * In case you need multiple permissions available in your application, use common selector.
 *
 * @example - on how to select all permissions.
 * ```
 *      const dashboardPermissions = useDashboardSelector(selectDashboardPermissions);
 *
 *      if (dashboardPermissions.canEditDashboard) {
 *          // allow user to do a action for which the `canEditDashboard` permission is needed
 *      }
 * ```
 *
 * If there is only limited number of permissions, use specific selector instead (available selectors are all below).
 *
 * @example - on how to select specific permission.
 * ```
 *      const canEditDashboard = useDashboardSelector(selectCanEditDashboard);
 *
 *      if (canEditDashboard) {
 *          // allow user to do a action for which the `canEditDashboard` permission is needed
 *      }
 * ```
 *
 * @public
 */
export const selectDashboardPermissions = createSelector(selectSelf, (state) => {
    invariant(state.dashboardPermissions, "attempting to access uninitialized dashboard permissions state");

    return state.dashboardPermissions!;
});

/**
 * Returns whether the current user has permissions to edit dashboard.
 *
 * @public
 */
export const selectCanEditDashboard = createSelector(selectDashboardPermissions, (state) => {
    return state?.canEditDashboard ?? false;
});
