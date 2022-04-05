// (C) 2019-2022 GoodData Corporation

/**
 * Workspace permission types
 *
 * @public
 */
export type WorkspacePermission =
    /**
     * Whether the current user has permissions to run MAQL DDL and DML, access a workspace staging directory.
     */
    | "canInitData"
    /**
     * Whether the current user has permissions to upload CSV files via CSV Uploader.
     */
    | "canUploadNonProductionCSV"
    /**
     * Whether the current user has permissions to download a complete report.
     */
    | "canExecuteRaw"
    /**
     * Whether the current user has permissions to export the report.
     */
    | "canExportReport"
    /**
     * Whether the current user has permissions to access GoodData portal directly (user can log in).
     */
    | "canAccessWorkbench"
    /**
     * Whether the current user has permissions to create a report object via API.
     */
    | "canCreateReport"
    /**
     * Whether the current user has permissions to create a KPI object, KPI widget object, and an insight object via API.
     */
    | "canCreateVisualization"
    /**
     * Whether the current user has permissions to create a KPI dashboard object via API.
     */
    | "canCreateAnalyticalDashboard"
    /**
     * Whether the current user has permissions to modify and delete a metric, run MAQL DDL, run the MAQL validator, change metric visibility via the `unlisted` flag.
     */
    | "canManageMetric"
    /**
     * Whether the current user has permissions to modify and delete a report object, change report visibility via the `unlisted` flag.
     */
    | "canManageReport"
    /**
     * Whether the current user has permissions to modify and delete a KPI dashboard object.
     */
    | "canManageAnalyticalDashboard"
    /**
     * Whether the current user has permissions to modify workspace metadata, see the workspace token, lock and unlock objects, delete locked objects, set and unset the restricted flag on objects, clear cache, delete a workspace.
     */
    | "canManageProject"
    /**
     * Whether the current user has permissions to create a scheduled email object and a KPI alert object.
     */
    | "canCreateScheduledMail"
    /**
     * Whether the current user has permissions to list users, roles, and permissions.
     */
    | "canListUsersInProject"
    /**
     * Whether the current user has permissions to modify and delete a domain, run MAQL DDL.
     */
    | "canManageDomain"
    /**
     * Whether the current user has permissions to invite a user to a workspace or delete an invitation.
     */
    | "canInviteUserToProject"
    /**
     * Whether the current user has permissions to run uploads, load date dimensions, access a workspace staging directory.
     */
    | "canRefreshData"
    /**
     * Whether the current user has permissions to add, remove, and list ACLs (Access Control Lists) on an object.
     */
    | "canManageACL"
    /**
     * Whether the current user has permissions to manage scheduled email objects.
     */
    | "canManageScheduledMail";

/**
 * Dictionary of workspace permissions
 *
 * @public
 */
export type IWorkspacePermissions = {
    [permission in WorkspacePermission]: boolean;
};
