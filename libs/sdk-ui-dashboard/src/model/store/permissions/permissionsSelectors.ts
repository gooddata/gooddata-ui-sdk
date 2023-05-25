// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardSelector, DashboardState } from "../types.js";
import { invariant } from "ts-invariant";
import { IWorkspacePermissions } from "@gooddata/sdk-model";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.permissions,
);

/**
 * This selector returns user's permissions in the workspace where the dashboard is stored.
 *
 * @remarks
 * It is expected that the selector is called only after the permission state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * See {@link @gooddata/sdk-backend-spi#WorkspacePermission} for all available permissions.
 *
 * If the permission is not supported by GoodData Cloud and GoodData.CN backends, the selector always returns `false` value.
 *
 * In case you need multiple permissions available in your application, use common selector.
 *
 * @example - on how to select all permissions.
 * ```
 *      const permissions = useDashboardSelector(selectPermissions);
 *
 *      if (permissions.canCreateAnalyticalDashboard) {
 *          // allow user to do a action for which the `canCreateAnalyticalDashboard` permission is needed
 *      }
 * ```
 *
 * If there is only limited number of permissions, use specific selector instead (available selectors are all below).
 *
 * @example - on how to select specific permission.
 * ```
 *      const canCreateAnalyticalDashboard = useDashboardSelector(selectCanCreateAnalyticalDashboard);
 *
 *      if (canCreateAnalyticalDashboard) {
 *          // allow user to do a action for which the `canCreateAnalyticalDashboard` permission is needed
 *      }
 * ```
 *
 * @public
 */
export const selectPermissions: DashboardSelector<IWorkspacePermissions> = createSelector(
    selectSelf,
    (state) => {
        invariant(state.permissions, "attempting to access uninitialized permissions state");

        return state.permissions!;
    },
);

/**
 * Returns whether the current user has permissions to list users, roles, and permissions.
 *
 * @public
 */
export const selectCanListUsersInWorkspace: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canListUsersInProject ?? false;
    },
);

/**
 * Returns whether the current user has permissions to modify workspace metadata, see the workspace token, lock and unlock objects, delete locked objects, set and unset the restricted flag on objects, clear cache, delete a workspace.
 *
 * @public
 */
export const selectCanManageWorkspace: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canManageProject ?? false;
    },
);

/**
 * Returns whether the current user has permissions necessary to export insights.
 *
 * @public
 */
export const selectCanExportReport: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canExportReport ?? false;
    },
);

/**
 * Returns whether the current user has permissions necessary to export insights to CSV, XLSX
 *
 * @public
 */
export const selectCanExportTabular: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return (state?.canExportReport || state?.canExportTabular) ?? false;
    },
);

/**
 * Returns whether the current user has permissions necessary to export insights to PDF
 *
 * @public
 */
export const selectCanExportPdf: DashboardSelector<boolean> = createSelector(selectPermissions, (state) => {
    return (state?.canExportReport || state?.canExportPdf) ?? false;
});

/**
 * Returns whether the current user has permissions to create a KPI dashboard object via API.
 *
 * @public
 */
export const selectCanCreateAnalyticalDashboard: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canCreateAnalyticalDashboard ?? false;
    },
);

/**
 * Returns whether the current user has permissions to modify and delete a KPI dashboard object.
 *
 * @public
 */
export const selectCanManageAnalyticalDashboard: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canManageAnalyticalDashboard ?? false;
    },
);

/**
 * Returns whether the current user has permissions to add, remove, and list ACLs (Access Control Lists) on an object.
 *
 * @public
 */
export const selectCanManageACL: DashboardSelector<boolean> = createSelector(selectPermissions, (state) => {
    return state?.canManageACL ?? false;
});

/**
 * Returns whether the current user has permissions to create a scheduled email object and a KPI alert object.
 *
 * @public
 */
export const selectCanCreateScheduledMail: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canCreateScheduledMail ?? false;
    },
);

/**
 * Returns whether the current user has permissions to run MAQL DDL and DML, access a workspace staging directory.
 *
 * @public
 */
export const selectCanInitData: DashboardSelector<boolean> = createSelector(selectPermissions, (state) => {
    return state?.canInitData ?? false;
});

/**
 * Returns whether the current user has permissions to upload CSV files via CSV Uploader.
 *
 * @public
 */
export const selectCanUploadNonProductionCSV: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canUploadNonProductionCSV ?? false;
    },
);

/**
 * Returns whether the current user has permissions necessary to export insights to CSV..
 *
 * @public
 */
export const selectCanExecuteRaw: DashboardSelector<boolean> = createSelector(selectPermissions, (state) => {
    return state?.canExecuteRaw ?? false;
});

/**
 * Returns whether the current user has permissions to create a KPI object, KPI widget object, and an insight object via API.
 *
 * @public
 */
export const selectCanCreateVisualization: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canCreateVisualization ?? false;
    },
);

/**
 * Returns whether the current user has permissions to modify and delete a metric, run MAQL DDL, run the MAQL validator, change metric visibility via the `unlisted` flag.
 *
 * @public
 */
export const selectCanManageMetric: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canManageMetric ?? false;
    },
);

/**
 * Returns whether the current user has permissions to modify and delete a domain, run MAQL DDL.
 *
 * @public
 */
export const selectCanManageDomain: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canManageDomain ?? false;
    },
);

/**
 * Returns whether the current user has permissions to invite a user to a workspace or delete an invitation.
 *
 * @public
 */
export const selectCanInviteUserToWorkspace: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canInviteUserToProject ?? false;
    },
);

/**
 * Returns whether the current user has permissions to run uploads, load date dimensions, access a workspace staging directory.
 *
 * @public
 */
export const selectCanRefreshData: DashboardSelector<boolean> = createSelector(selectPermissions, (state) => {
    return state?.canRefreshData ?? false;
});

/**
 * Returns whether the current user has permissions to manage scheduled email objects.
 *
 * @public
 */
export const selectCanManageScheduledMail: DashboardSelector<boolean> = createSelector(
    selectPermissions,
    (state) => {
        return state?.canManageScheduledMail ?? false;
    },
);
