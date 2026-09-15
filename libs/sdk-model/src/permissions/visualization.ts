// (C) 2026 GoodData Corporation

import { type AccessGranularPermission } from "../accessControl/index.js";

import { type IWorkspacePermissions } from "./index.js";

/**
 * Effective EDIT capability for a single visualization.
 *
 * @remarks
 * Same shape as {@link canEditMetric}: a workspace admin can always edit, and behind
 * enableVisualizationPermissions the visualization's own EDIT grants it to everyone else. Before the
 * flag, editing was decided by the workspace role alone, which callers keep checking separately.
 *
 * @param visualizationPermissions - the visualization's own permissions, absent when they were not requested
 * @param workspacePermissions - the user's workspace permissions
 * @param areVisualizationPermissionsEnabled - the enableVisualizationPermissions feature flag
 *
 * @alpha
 */
export function canEditVisualization(
    visualizationPermissions: AccessGranularPermission[] | undefined,
    workspacePermissions: IWorkspacePermissions,
    areVisualizationPermissionsEnabled: boolean,
): boolean {
    return (
        workspacePermissions.canManageProject ||
        (areVisualizationPermissionsEnabled && (visualizationPermissions?.includes("EDIT") ?? false))
    );
}

/**
 * Effective SHARE capability for a single visualization.
 *
 * @remarks
 * Same shape as {@link canShareMetric}: a workspace admin can always share, otherwise the
 * visualization's own SHARE decides. Deliberately not derived from EDIT. Sharing a visualization did
 * not exist before enableVisualizationPermissions, so it stays off entirely without the flag.
 *
 * @param visualizationPermissions - the visualization's own permissions, absent when they were not requested
 * @param workspacePermissions - the user's workspace permissions
 * @param areVisualizationPermissionsEnabled - the enableVisualizationPermissions feature flag
 *
 * @alpha
 */
export function canShareVisualization(
    visualizationPermissions: AccessGranularPermission[] | undefined,
    workspacePermissions: IWorkspacePermissions,
    areVisualizationPermissionsEnabled: boolean,
): boolean {
    if (!areVisualizationPermissionsEnabled) {
        return false;
    }
    return workspacePermissions.canManageProject || (visualizationPermissions?.includes("SHARE") ?? false);
}
