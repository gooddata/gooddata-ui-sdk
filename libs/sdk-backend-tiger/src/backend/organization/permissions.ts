// (C) 2023-2026 GoodData Corporation

import { type ITigerClientBase, type PermissionsAssignment } from "@gooddata/api-client-tiger";
import { ActionsApi_ManageOrganizationPermissions } from "@gooddata/api-client-tiger/endpoints/actions";
import { LayoutApi_GetOrganizationPermissions } from "@gooddata/api-client-tiger/endpoints/layout";
import {
    UserManagementApi_AssignPermissions,
    UserManagementApi_ListPermissionsForUser,
    UserManagementApi_ListPermissionsForUserGroup,
    UserManagementApi_RevokePermissions,
} from "@gooddata/api-client-tiger/endpoints/userManagement";
import { type IOrganizationPermissionService, type IPermissionsAssignment } from "@gooddata/sdk-backend-spi";
import {
    type IDataSourcePermissionAssignment,
    type IOrganizationPermissionAssignment,
    type IWorkspacePermissionAssignment,
    type OrganizationPermissionAssignment,
} from "@gooddata/sdk-model";

import {
    convertDataSourcePermissionsAssignment,
    convertWorkspacePermissionsAssignment,
} from "./fromBackend/userConvertor.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

const fetchOrganizationPermissions = async (client: ITigerClientBase, userId: string) => {
    return LayoutApi_GetOrganizationPermissions(client.axios, client.basePath)
        .then((response) => response.data)
        .then((permissions) =>
            permissions
                .filter((permission) => permission.assignee.id === userId)
                .map((permission) => permission.name),
        );
};

export class OrganizationPermissionService implements IOrganizationPermissionService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public getPermissionsForUser = async (
        userId: string,
    ): Promise<{
        workspacePermissions: IWorkspacePermissionAssignment[];
        dataSourcePermissions: IDataSourcePermissionAssignment[];
    }> => {
        return this.authCall(async (client) => {
            return UserManagementApi_ListPermissionsForUser(client.axios, client.basePath, { userId })
                .then((response) => response.data)
                .then((response) => ({
                    workspacePermissions: response.workspaces.map((assignment) =>
                        convertWorkspacePermissionsAssignment(userId, "user", assignment),
                    ),
                    dataSourcePermissions: response.dataSources.map((assignment) =>
                        convertDataSourcePermissionsAssignment(userId, "user", assignment),
                    ),
                }));
        });
    };

    public getPermissionsForUserGroup = async (
        userGroupId: string,
    ): Promise<{
        workspacePermissions: IWorkspacePermissionAssignment[];
        dataSourcePermissions: IDataSourcePermissionAssignment[];
    }> => {
        return this.authCall(async (client) => {
            return UserManagementApi_ListPermissionsForUserGroup(client.axios, client.basePath, {
                userGroupId,
            })
                .then((response) => response.data)
                .then((response) => ({
                    workspacePermissions: response.workspaces.map((assignment) =>
                        convertWorkspacePermissionsAssignment(userGroupId, "userGroup", assignment),
                    ),
                    dataSourcePermissions: response.dataSources.map((assignment) =>
                        convertDataSourcePermissionsAssignment(userGroupId, "userGroup", assignment),
                    ),
                }));
        });
    };

    public getOrganizationPermissionForUser = async (
        userId: string,
    ): Promise<OrganizationPermissionAssignment[]> => {
        return this.authCall(async (client) => {
            return fetchOrganizationPermissions(client, userId);
        });
    };

    public getOrganizationPermissionForUserGroup = async (
        userGroupId: string,
    ): Promise<OrganizationPermissionAssignment[]> => {
        return this.authCall(async (client) => {
            return fetchOrganizationPermissions(client, userGroupId);
        });
    };

    public updateOrganizationPermissions = async (
        permissionAssignments: IOrganizationPermissionAssignment[],
    ): Promise<void> => {
        return this.authCall(async (client) => {
            await ActionsApi_ManageOrganizationPermissions(client.axios, client.basePath, {
                organizationPermissionAssignment: permissionAssignments,
            });
        });
    };

    public assignPermissions(permissionsAsignment: IPermissionsAssignment): Promise<void> {
        return this.authCall(async (client) => {
            await UserManagementApi_AssignPermissions(client.axios, client.basePath, {
                permissionsAssignment: convertPermissionsAssignment(permissionsAsignment),
            });
        });
    }

    public revokePermissions(permissionsAsignment: IPermissionsAssignment): Promise<void> {
        return this.authCall(async (client) => {
            await UserManagementApi_RevokePermissions(client.axios, client.basePath, {
                permissionsAssignment: convertPermissionsAssignment(permissionsAsignment),
            });
        });
    }
}

function convertPermissionsAssignment(permissionsAssignment: IPermissionsAssignment): PermissionsAssignment {
    return {
        assignees: permissionsAssignment.assignees,
        dataSources:
            permissionsAssignment.dataSources?.map((ds) => ({
                id: ds.dataSource.id,
                permissions: ds.permissions,
            })) ?? [],
        workspaces:
            permissionsAssignment.workspaces?.map((ws) => ({
                id: ws.workspace.id,
                permissions: ws.permissions,
                hierarchyPermissions: ws.hierarchyPermissions,
            })) ?? [],
    };
}
