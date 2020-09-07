// (C) 2019-2020 GoodData Corporation

/**
 * Workspace represents a set of related data, insights and so on.
 *
 * TODO: move to backend spi, rename to workspace descriptor; favor IAnalyticalWorkspace
 *
 * @public
 */
export interface IWorkspace {
    id: string;
    title: string;
    description: string;
    isDemo?: boolean;
}

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
    | "canManageDomain";

/**
 * Dictionary of workspace permissions
 *
 * @public
 */
export type IWorkspacePermissions = {
    [permission in WorkspacePermission]: boolean;
};
