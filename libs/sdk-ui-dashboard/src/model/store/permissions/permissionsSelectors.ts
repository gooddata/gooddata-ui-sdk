// (C) 2021-2022 GoodData Corporation
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
 * @public
 */
export const selectPermissions = createSelector(selectSelf, (filterContextState) => {
    invariant(filterContextState.permissions, "attempting to access uninitialized permissions state");

    return filterContextState.permissions!;
});

/**
 * Returns whether the current user has permissions to list users, roles, and permissions.
 *
 * @public
 */
export const selectCanListUsersInWorkspace = createSelector(selectPermissions, (state) => {
    return state?.canListUsersInProject ?? false;
});

/**
 * Returns whether the current user has permissions to modify workspace metadata, see the workspace token, lock and unlock objects, delete locked objects, set and unset the restricted flag on objects, clear cache, delete a workspace.
 *
 * @public
 */
export const selectCanManageWorkspace = createSelector(selectPermissions, (state) => {
    return state?.canManageProject ?? false;
});

/**
 * Returns whether the current user has permissions necessary to export insights to CSV and XLSX.
 *
 * @public
 */
export const selectCanExportReport = createSelector(selectPermissions, (state) => {
    return state?.canExportReport ?? false;
});

/**
 * Returns whether the current user has permissions to create a KPI dashboard object via API.
 *
 * @public
 */
export const selectCanCreateAnalyticalDashboard = createSelector(selectPermissions, (state) => {
    return state?.canCreateAnalyticalDashboard ?? false;
});

/**
 * Returns whether the current user has permissions to modify and delete a KPI dashboard object.
 *
 * @public
 */
export const selectCanManageAnalyticalDashboard = createSelector(selectPermissions, (state) => {
    return state?.canManageAnalyticalDashboard ?? false;
});

/**
 * Returns whether the current user has permissions to add, remove, and list ACLs (Access Control Lists) on an object.
 *
 * @public
 */
export const selectCanManageACL = createSelector(selectPermissions, (state) => {
    return state?.canManageACL ?? false;
});

/**
 * Returns whether the current user has permissions to create a scheduled email object and a KPI alert object.
 *
 * @public
 */
export const selectCanCreateScheduledMail = createSelector(selectPermissions, (state) => {
    return state?.canCreateScheduledMail ?? false;
});

/**
 * Returns whether the current user has permissions to run MAQL DDL and DML, access a workspace staging directory.
 *
 * @public
 */
export const selectCanInitData = createSelector(selectPermissions, (state) => {
    return state?.canInitData ?? false;
});

/**
 * Returns whether the current user has permissions to upload CSV files via CSV Uploader.
 *
 * @public
 */
export const selectCanUploadNonProductionCSV = createSelector(selectPermissions, (state) => {
    return state?.canUploadNonProductionCSV ?? false;
});

/**
 * Returns whether the current user has permissions necessary to export insights to CSV..
 *
 * @public
 */
export const selectCanExecuteRaw = createSelector(selectPermissions, (state) => {
    return state?.canExecuteRaw ?? false;
});

/**
 * Returns whether the current user has permissions to create a KPI object, KPI widget object, and an insight object via API.
 *
 * @public
 */
export const selectCanCreateVisualization = createSelector(selectPermissions, (state) => {
    return state?.canCreateVisualization ?? false;
});

/**
 * Returns whether the current user has permissions to modify and delete a metric, run MAQL DDL, run the MAQL validator, change metric visibility via the `unlisted` flag.
 *
 * @public
 */
export const selectCanManageMetric = createSelector(selectPermissions, (state) => {
    return state?.canManageMetric ?? false;
});

/**
 * Returns whether the current user has permissions to modify and delete a domain, run MAQL DDL.
 *
 * @public
 */
export const selectCanManageDomain = createSelector(selectPermissions, (state) => {
    return state?.canManageDomain ?? false;
});

/**
 * Returns whether the current user has permissions to invite a user to a workspace or delete an invitation.
 *
 * @public
 */
export const selectCanInviteUserToWorkspace = createSelector(selectPermissions, (state) => {
    return state?.canInviteUserToProject ?? false;
});

/**
 * Returns whether the current user has permissions to run uploads, load date dimensions, access a workspace staging directory.
 *
 * @public
 */
export const selectCanRefreshData = createSelector(selectPermissions, (state) => {
    return state?.canRefreshData ?? false;
});
