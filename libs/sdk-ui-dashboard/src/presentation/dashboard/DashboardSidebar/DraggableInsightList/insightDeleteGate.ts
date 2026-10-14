// (C) 2026 GoodData Corporation

import {
    type IInsight,
    type ISettings,
    type IWorkspacePermissions,
    canEditVisualization,
    insightIsLocked,
} from "@gooddata/sdk-model";

/** Whether the delete action is offered on the visualization list at all. */
function isInsightDeleteEnabled(settings: ISettings | undefined): boolean {
    return !!settings?.enableDashboardVisualizationDelete;
}

/**
 * Whether the rows need the caller's per-insight permissions to decide the delete action.
 *
 * @internal
 */
export function shouldLoadInsightPermissionsForDelete(
    settings: ISettings | undefined,
    permissions: IWorkspacePermissions,
): boolean {
    return (
        isInsightDeleteEnabled(settings) &&
        !!settings?.enableVisualizationPermissions &&
        !permissions.canManageProject
    );
}

/**
 * Whether the current user may delete the insight. Unloaded permissions count as no right.
 *
 * @internal
 */
export function canDeleteInsight(
    insight: IInsight,
    settings: ISettings | undefined,
    permissions: IWorkspacePermissions,
): boolean {
    if (!isInsightDeleteEnabled(settings) || insightIsLocked(insight)) {
        return false;
    }
    return canEditVisualization(
        insight.insight.permissions,
        permissions,
        !!settings?.enableVisualizationPermissions,
    );
}
