// (C) 2023 GoodData Corporation

import { IWorkspacePermissionAssignment } from "@gooddata/sdk-model";

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
     * Update assigned workspaces of the user and their permissions.
     *
     * @param userId - ID of the user.
     * @param permissions - list of updated permissions.
     *
     * @returns promise
     */
    updateWorkspacePermissionsForUser(
        userId: string,
        permissions: IWorkspacePermissionAssignment[],
    ): Promise<void>;

    /**
     * Update assigned workspaces of the user group and their permissions.
     *
     * @param userGroupId - ID of the user group.
     * @param permissions - list of updated permissions.
     *
     * @returns promise
     */
    updateWorkspacePermissionsForUserGroup(
        userGroupId: string,
        permissions: IWorkspacePermissionAssignment[],
    ): Promise<void>;

    /**
     * Update organization admin of the user.
     *
     * @param userId - ID of the user.
     * @param isOrganizationAdmin - true if user must be made an organization admin, false if user must no longer be organization admin.
     *
     * @returns promise
     */
    updateUserOrganizationAdminStatus(userId: string, isOrganizationAdmin: boolean): Promise<void>;
}
