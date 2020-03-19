// (C) 2019-2020 GoodData Corporation
import { WorkspacePermission, IWorkspacePermissions } from "@gooddata/sdk-model";

/**
 * Service to query workspace permissions
 *
 * @public
 */
export interface IWorkspacePermissionsFactory {
    /**
     * Request workspace permissions for the currently authenticated user
     *
     * @returns promise of user workspace permissions
     */
    forCurrentUser(): Promise<IWorkspaceUserPermissions>;
}

/**
 * Service to obtain or check user permissions
 *
 * @public
 */
export interface IWorkspaceUserPermissions {
    /**
     * Get all user permissions in current workspace
     *
     * @returns dictionary with all user workspace permissions
     */
    allPermissions(): IWorkspacePermissions;

    /**
     * Checks if user has provided permission in current workspace
     *
     * @param permission - permission to check
     * @returns boolean
     */
    hasPermission(permission: WorkspacePermission): boolean;
}
