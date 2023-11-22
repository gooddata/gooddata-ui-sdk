// (C) 2023 GoodData Corporation

import {
    IWorkspacePermissionAssignment,
    IOrganizationPermissionAssignment,
    OrganizationPermissionAssignment,
} from "@gooddata/sdk-model";

/**
 * This service provides access to organization permissions.
 *
 * @alpha
 */
export interface IOrganizationPermissionService {
    /**
     * Get list of assigned workspaces of the user and their permissions.
     *
     * @param userId - ID of the user.
     *
     * @returns promise
     */
    getWorkspacePermissionsForUser(userId: string): Promise<IWorkspacePermissionAssignment[]>;

    /**
     * Get list of assigned workspaces of the user group and their permissions.
     *
     * @param userGroupId - ID of the user.
     *
     * @returns promise
     */
    getWorkspacePermissionsForUserGroup(userGroupId: string): Promise<IWorkspacePermissionAssignment[]>;

    /**
     * Update assigned workspaces of the users or user groups and their permissions.
     *
     * @param permissions - list of updated permissions.
     *
     * @returns promise
     */
    updateWorkspacePermissions(permissions: IWorkspacePermissionAssignment[]): Promise<void>;

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
}
