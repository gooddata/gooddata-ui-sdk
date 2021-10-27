// (C) 2019-2021 GoodData Corporation

/**
 * Workspace permission types
 *
 * @public
 */
export type WorkspacePermission =
    | "canInitData"
    | "canUploadNonProductionCSV"
    | "canExecuteRaw"
    | "canExportReport"
    | "canAccessWorkbench"
    | "canCreateReport"
    | "canCreateVisualization"
    | "canCreateAnalyticalDashboard"
    | "canManageMetric"
    | "canManageReport"
    | "canManageAnalyticalDashboard"
    | "canManageProject"
    | "canCreateScheduledMail"
    | "canListUsersInProject"
    | "canManageDomain"
    | "canInviteUserToProject"
    | "canRefreshData"
    | "canManageACL";

/**
 * Dictionary of workspace permissions
 *
 * @public
 */
export type IWorkspacePermissions = {
    [permission in WorkspacePermission]: boolean;
};

/**
 * Service to query workspace permissions
 *
 * @public
 */
export interface IWorkspacePermissionsService {
    /**
     * Request workspace permissions for the currently authenticated user
     *
     * @returns promise of user workspace permissions
     */
    getPermissionsForCurrentUser(): Promise<IWorkspacePermissions>;
}
