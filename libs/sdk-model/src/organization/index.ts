// (C) 2021-2022 GoodData Corporation

/**
 * Organization descriptor contains details about the organization that services analytical workspaces.
 *
 * @public
 */
export interface IOrganizationDescriptor {
    id: string;
    title: string;
}

/**
 * Information about assigned workspace.
 *
 * @alpha
 */
export interface IAssignedWorkspace {
    id: string;
    name?: string;
}

/**
 * Possible workspace permissions that can be assigned either directly or hierarchically.
 *
 * @alpha
 */
export const AssignedWorkspacePermissionValue = {
    MANAGE: "MANAGE",
    ANALYZE: "ANALYZE",
    EXPORT: "EXPORT",
    EXPORT_TABULAR: "EXPORT_TABULAR",
    EXPORT_PDF: "EXPORT_PDF",
    VIEW: "VIEW",
} as const;

/**
 * Workspace permission values.
 *
 * @alpha
 */
export type AssignedWorkspacePermission =
    typeof AssignedWorkspacePermissionValue[keyof typeof AssignedWorkspacePermissionValue];

/**
 * Descriptor contains details about workspace permission of organization user or user group.
 *
 * @alpha
 */
export interface IWorkspacePermissionAssignment {
    workspace: IAssignedWorkspace;
    permissions: AssignedWorkspacePermission[];
    hierarchyPermissions: AssignedWorkspacePermission[];
}
