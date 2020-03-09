// (C) 2019-2020 GoodData Corporation
import { WorkspacePermission, IWorkspacePermissions } from "@gooddata/sdk-model";

/**
 *
 * @public
 */
export interface IWorkspacePermissionsFactory {
    forCurrentUser(): Promise<IWorkspaceUserPermissions>;
}

/**
 *
 * @public
 */
export interface IWorkspaceUserPermissions {
    /**
     * Get all user permissions in current workspace
     */
    allPermissions(): IWorkspacePermissions;

    /**
     * Checks if user has provided permission in current workspace
     */
    hasPermission(permission: WorkspacePermission): boolean;
}
