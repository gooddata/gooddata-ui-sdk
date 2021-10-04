// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.permissions,
);

/**
 * This selector returns user's permissions in the workspace where the dashboard is stored. It is expected that the
 * selector is called only after the permission state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectPermissions = createSelector(selectSelf, (filterContextState) => {
    invariant(filterContextState.permissions, "attempting to access uninitialized permissions state");

    return filterContextState.permissions!;
});

/**
 * Returns whether the current user has permissions to list other users in the workspace.
 *
 * @alpha
 */
export const selectCanListUsersInWorkspace = createSelector(selectPermissions, (state) => {
    return state?.canListUsersInProject ?? false;
});

/**
 * Returns whether the current user has permissions to manage current workspace.
 *
 * @alpha
 */
export const selectCanManageWorkspace = createSelector(selectPermissions, (state) => {
    return state?.canManageProject ?? false;
});

/**
 * Returns whether the current user has permissions to export the report.
 *
 * @alpha
 */
export const selectCanExportReport = createSelector(selectPermissions, (state) => {
    return state?.canExportReport ?? false;
});

/**
 * Returns whether the current user has permissions to create the analytical dashboard.
 *
 * @alpha
 */
export const selectCanCreateAnalyticalDashboard = createSelector(selectPermissions, (state) => {
    return state?.canCreateAnalyticalDashboard ?? false;
});
