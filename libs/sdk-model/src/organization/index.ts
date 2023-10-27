// (C) 2021-2022 GoodData Corporation

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
