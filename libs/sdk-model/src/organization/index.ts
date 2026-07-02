// (C) 2021-2026 GoodData Corporation

import { type ObjRef } from "../objRef/index.js";

/**
 * Organization descriptor contains details about the organization that services analytical workspaces.
 *
 * @public
 */
export interface IOrganizationDescriptor {
    id: string;
    title: string;
    bootstrapUser?: ObjRef;
    bootstrapUserGroup?: ObjRef;
    /**
     * @deprecated - use early access values instead
     */
    earlyAccess?: string;
    earlyAccessValues?: string[];
    identityProviderType?: string;
    region?: string;
    dataCenter?: string;
}

/**
 * Organization descriptor properties to update.
 * Optional properties can be set to null to delete the value.
 *
 * @see IOrganizationDescriptor
 * @public
 */
export interface IOrganizationDescriptorUpdate {
    title?: string;
    /**
     * @deprecated - use early access values instead
     */
    earlyAccess?: string | null;
    earlyAccessValues?: string[] | null;
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
    CREATE_FILTER_VIEW: "CREATE_FILTER_VIEW",
    VIEW: "VIEW",
    CREATE_AUTOMATION: "CREATE_AUTOMATION",
    USE_AI_ASSISTANT: "USE_AI_ASSISTANT",
} as const;

/**
 * Workspace permission values.
 *
 * @alpha
 */
export type AssignedWorkspacePermission =
    (typeof AssignedWorkspacePermissionValue)[keyof typeof AssignedWorkspacePermissionValue];

/**
 * Type guard to check if a value is an AssignedWorkspacePermission.
 *
 * @alpha
 */
export function isAssignedWorkspacePermission(value: unknown): value is AssignedWorkspacePermission {
    return (
        typeof value === "string" &&
        Object.values(AssignedWorkspacePermissionValue).includes(value as AssignedWorkspacePermission)
    );
}

/**
 * @alpha
 */
export interface IOrganizationAssignee {
    id: string;
    type: "user" | "userGroup";
}

/**
 * How a subject gains access to a workspace.
 *
 * @alpha
 */
export const WorkspaceAccessSourceValue = {
    DIRECT: "DIRECT",
    GROUP: "GROUP",
    HIERARCHY: "HIERARCHY",
} as const;

/**
 * Workspace access source values: directly assigned, inherited from a user group, or inherited from a
 * parent workspace's hierarchy permission.
 *
 * @alpha
 */
export type WorkspaceAccessSource =
    (typeof WorkspaceAccessSourceValue)[keyof typeof WorkspaceAccessSourceValue];

/**
 * Descriptor contains details about workspace permission of organization user or user group.
 *
 * @alpha
 */
export interface IWorkspacePermissionAssignment {
    assigneeIdentifier: IOrganizationAssignee;
    workspace: IAssignedWorkspace;
    permissions: AssignedWorkspacePermission[];
    hierarchyPermissions: AssignedWorkspacePermission[];
    /**
     * How the subject gains access to the workspace. Present only when effective (inherited-aware)
     * permissions were requested; absent for direct-only listings.
     */
    accessSource?: WorkspaceAccessSource;
}

/**
 * Information about assigned data source.
 *
 * @alpha
 */
export interface IAssignedDataSource {
    id: string;
    name?: string;
}

/**
 * Possible data source permissions that can be assigned.
 *
 * @alpha
 */
export const AssignedDataSourcePermissionValue = {
    MANAGE: "MANAGE",
    USE: "USE",
} as const;

/**
 * Data source permission values.
 *
 * @alpha
 */
export type AssignedDataSourcePermission =
    (typeof AssignedDataSourcePermissionValue)[keyof typeof AssignedDataSourcePermissionValue];

/**
 * How a subject gains access to a data source.
 *
 * @alpha
 */
export const DataSourceAccessSourceValue = {
    DIRECT: "DIRECT",
    GROUP: "GROUP",
} as const;

/**
 * Data source access source values: directly assigned or inherited from a user group.
 *
 * @alpha
 */
export type DataSourceAccessSource =
    (typeof DataSourceAccessSourceValue)[keyof typeof DataSourceAccessSourceValue];

/**
 * Descriptor contains details about data source permission of organization user or user group.
 *
 * @alpha
 */
export interface IDataSourcePermissionAssignment {
    assigneeIdentifier: IOrganizationAssignee;
    dataSource: IAssignedDataSource;
    permissions: AssignedDataSourcePermission[];
    /**
     * How the subject gains access to the data source. Present only when effective (inherited-aware)
     * permissions were requested; absent for direct-only listings.
     */
    accessSource?: DataSourceAccessSource;
}

/**
 * @alpha
 */
export const OrganizationPermissionAssignmentValue = {
    MANAGE: "MANAGE",
    SELF_CREATE_TOKEN: "SELF_CREATE_TOKEN",
    BASE_UI_ACCESS: "BASE_UI_ACCESS",
} as const;

/**
 * @alpha
 */
export type OrganizationPermissionAssignment =
    (typeof OrganizationPermissionAssignmentValue)[keyof typeof OrganizationPermissionAssignmentValue];

/**
 * @alpha
 */
export interface IOrganizationPermissionAssignment {
    assigneeIdentifier: IOrganizationAssignee;
    permissions: OrganizationPermissionAssignment[];
}
