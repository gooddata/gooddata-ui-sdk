// (C) 2019 GoodData Corporation
import { WorkspacePermission } from "@gooddata/sdk-model";

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
     * Checks if user has provided permission in current workspace
     */
    hasPermission(permission: WorkspacePermission): boolean;
}
