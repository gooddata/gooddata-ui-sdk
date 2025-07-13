// (C) 2021-2025 GoodData Corporation

import { ObjRef } from "../objRef/index.js";

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
    typeof AssignedWorkspacePermissionValue[keyof typeof AssignedWorkspacePermissionValue];

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
 * Descriptor contains details about workspace permission of organization user or user group.
 *
 * @alpha
 */
export interface IWorkspacePermissionAssignment {
    assigneeIdentifier: IOrganizationAssignee;
    workspace: IAssignedWorkspace;
    permissions: AssignedWorkspacePermission[];
    hierarchyPermissions: AssignedWorkspacePermission[];
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
    typeof AssignedDataSourcePermissionValue[keyof typeof AssignedDataSourcePermissionValue];

/**
 * Descriptor contains details about data source permission of organization user or user group.
 *
 * @alpha
 */
export interface IDataSourcePermissionAssignment {
    assigneeIdentifier: IOrganizationAssignee;
    dataSource: IAssignedDataSource;
    permissions: AssignedDataSourcePermission[];
}

/**
 * @alpha
 */
export const OrganizationPermissionAssignmentValue = {
    MANAGE: "MANAGE",
    SELF_CREATE_TOKEN: "SELF_CREATE_TOKEN",
} as const;

/**
 * @alpha
 */
export type OrganizationPermissionAssignment =
    typeof OrganizationPermissionAssignmentValue[keyof typeof OrganizationPermissionAssignmentValue];

/**
 * @alpha
 */
export interface IOrganizationPermissionAssignment {
    assigneeIdentifier: IOrganizationAssignee;
    permissions: OrganizationPermissionAssignment[];
}
