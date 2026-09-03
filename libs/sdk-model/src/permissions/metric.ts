// (C) 2026 GoodData Corporation

import { type AccessGranularPermission } from "../accessControl/index.js";

import { type IWorkspacePermissions } from "./index.js";

/**
 * Effective CREATE capability for metrics in a workspace.
 *
 * @remarks
 * Behind enableMetricPermissions the granular CREATE_METRIC permission decides, otherwise the
 * original canManageProject check applies. Drop the branch when the flag is removed.
 *
 * @param workspacePermissions - the user's workspace permissions
 * @param areMetricPermissionsEnabled - the enableMetricPermissions feature flag
 *
 * @alpha
 */
export function canCreateMetric(
    workspacePermissions: IWorkspacePermissions,
    areMetricPermissionsEnabled: boolean,
): boolean {
    return areMetricPermissionsEnabled
        ? workspacePermissions.canCreateMetric
        : workspacePermissions.canManageProject;
}

/**
 * Effective EDIT capability for a single metric.
 *
 * @remarks
 * A workspace admin can always edit, matching how dashboards behave — `getDashboardPermissions`
 * short-circuits to EDIT when the workspace grants MANAGE, and MANAGE is what canManageProject
 * is built from. Behind enableMetricPermissions the metric's own EDIT grants it to everyone else.
 *
 * Only admins could edit metrics before the flag, so this can only ever grant edit, never take
 * it away. Drop the flag term when the flag is removed.
 *
 * @param metricPermissions - the metric's own permissions, absent when they were not requested
 * @param workspacePermissions - the user's workspace permissions
 * @param areMetricPermissionsEnabled - the enableMetricPermissions feature flag
 *
 * @alpha
 */
export function canEditMetric(
    metricPermissions: AccessGranularPermission[] | undefined,
    workspacePermissions: IWorkspacePermissions,
    areMetricPermissionsEnabled: boolean,
): boolean {
    return (
        workspacePermissions.canManageProject ||
        (areMetricPermissionsEnabled && (metricPermissions?.includes("EDIT") ?? false))
    );
}

/**
 * Effective SHARE capability for a single metric.
 *
 * @remarks
 * Same shape as {@link canEditMetric}: a workspace admin can always share, otherwise the metric's
 * own SHARE decides. Deliberately not derived from EDIT — the permissions are read independently
 * rather than as an EDIT ⊃ SHARE ⊃ VIEW hierarchy.
 *
 * Unlike editing, sharing a metric did not exist before enableMetricPermissions, so it stays off
 * entirely without the flag.
 *
 * @param metricPermissions - the metric's own permissions, absent when they were not requested
 * @param workspacePermissions - the user's workspace permissions
 * @param areMetricPermissionsEnabled - the enableMetricPermissions feature flag
 *
 * @alpha
 */
export function canShareMetric(
    metricPermissions: AccessGranularPermission[] | undefined,
    workspacePermissions: IWorkspacePermissions,
    areMetricPermissionsEnabled: boolean,
): boolean {
    if (!areMetricPermissionsEnabled) {
        return false;
    }
    return workspacePermissions.canManageProject || (metricPermissions?.includes("SHARE") ?? false);
}
