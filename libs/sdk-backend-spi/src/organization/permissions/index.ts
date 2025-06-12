// (C) 2023-2024 GoodData Corporation

import {
    IWorkspacePermissionAssignment,
    IOrganizationPermissionAssignment,
    OrganizationPermissionAssignment,
    IDataSourcePermissionAssignment,
    IOrganizationAssignee,
} from "@gooddata/sdk-model";

/**
 *  Specification of the assignees and permissions to be assigned / revoked to them.
 *
 * @alpha
 */
export interface IPermissionsAssignment {
    /**
     * List of the users to whom the permissions are assigned / revoked.
     */
    assignees: IOrganizationAssignee[];

    /**
     * List of the workspaces and permissions to assign / revoke to list of the assignees.
     */
    workspaces?: Omit<IWorkspacePermissionAssignment, "assigneeIdentifier">[];

    /**
     * List of the data sources and permissions to assign / revoke to list of the assignees.
     */
    dataSources?: Omit<IDataSourcePermissionAssignment, "assigneeIdentifier">[];
}

/**
 * This service provides access to organization permissions.
 *
 * @alpha
 */
export interface IOrganizationPermissionService {
    /**
     * Get list of assigned workspaces and data sources of the user and their permissions.
     *
     * @param userId - ID of the user.
     *
     * @returns promise
     */
    getPermissionsForUser(userId: string): Promise<{
        workspacePermissions: IWorkspacePermissionAssignment[];
        dataSourcePermissions: IDataSourcePermissionAssignment[];
    }>;

    /**
     * Get list of assigned workspaces and data sources of the user group and their permissions.
     *
     * @param userId - ID of the user.
     *
     * @returns promise
     */
    getPermissionsForUserGroup(userGroupId: string): Promise<{
        workspacePermissions: IWorkspacePermissionAssignment[];
        dataSourcePermissions: IDataSourcePermissionAssignment[];
    }>;

    /**
     * Get list of organization permissions assigned to the user.
     *
     * @param userId - ID of the user.
     *
     * @returns promise
     */
    getOrganizationPermissionForUser(userId: string): Promise<OrganizationPermissionAssignment[]>;

    /**
     * Get list of organization permissions assigned to the user group.
     *
     * @param userGroupId - ID of the user.
     *
     * @returns promise
     */
    getOrganizationPermissionForUserGroup(userGroupId: string): Promise<OrganizationPermissionAssignment[]>;

    /**
     * Update organization permission for the user or user group.
     *
     * @param permissionAssignments - new sets of permission assignments to the organization. Set permissions property for assignee to an empty array to remove the user's permissions.
     *
     * @returns promise
     */
    updateOrganizationPermissions(permissionAssignments: IOrganizationPermissionAssignment[]): Promise<void>;

    /**
     * Assigns workspace and or data source permissions to list of the assignees.
     *
     * @param permissionsAsignment - specification of the assignees and permissions to be assigned.
     *
     * @returns promise
     */
    assignPermissions(permissionsAsignment: IPermissionsAssignment): Promise<void>;

    /**
     * Revokes workspace and or data source permissions to list of the assignees.
     *
     * @param permissionsAsignment - specification of the assignees and permissions to be revoked.
     *
     * @returns promise
     */
    revokePermissions(permissionsAsignment: IPermissionsAssignment): Promise<void>;
}
