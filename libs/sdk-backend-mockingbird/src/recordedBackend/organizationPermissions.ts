// (C) 2023 GoodData Corporation

import { IOrganizationPermissionService } from "@gooddata/sdk-backend-spi";
import {
    IWorkspacePermissionAssignment,
    OrganizationPermissionAssignment,
    IOrganizationPermissionAssignment,
} from "@gooddata/sdk-model";

import { RecordedBackendConfig } from "./types.js";

/**
 * @internal
 */
export class RecordedOrganizationPermissionService implements IOrganizationPermissionService {
    private readonly config: RecordedBackendConfig = {};

    constructor(config: RecordedBackendConfig) {
        this.config = config;
    }

    public getWorkspacePermissionsForUser = (userId: string): Promise<IWorkspacePermissionAssignment[]> => {
        if (this.config.getWorkspacePermissionsForUser) {
            return Promise.resolve(this.config.getWorkspacePermissionsForUser(userId));
        }
        return Promise.resolve([]);
    };

    public getWorkspacePermissionsForUserGroup = (
        userGroupId: string,
    ): Promise<IWorkspacePermissionAssignment[]> => {
        if (this.config.getWorkspacePermissionsForUserGroup) {
            return Promise.resolve(this.config.getWorkspacePermissionsForUserGroup(userGroupId));
        }
        return Promise.resolve([]);
    };

    public updateWorkspacePermissions(_permissions: IWorkspacePermissionAssignment[]): Promise<void> {
        return Promise.resolve();
    }

    public getOrganizationPermissionForUser(_userId: string): Promise<OrganizationPermissionAssignment[]> {
        return Promise.resolve([]);
    }

    public getOrganizationPermissionForUserGroup(
        _userGroupId: string,
    ): Promise<OrganizationPermissionAssignment[]> {
        return Promise.resolve([]);
    }

    public updateOrganizationPermissions(
        _permissionAssignments: IOrganizationPermissionAssignment[],
    ): Promise<void> {
        return Promise.resolve();
    }
}
