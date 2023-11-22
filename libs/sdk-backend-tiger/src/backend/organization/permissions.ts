// (C) 2023 GoodData Corporation

import { IOrganizationPermissionService } from "@gooddata/sdk-backend-spi";
import {
    IWorkspacePermissionAssignment,
    IOrganizationPermissionAssignment,
    OrganizationPermissionAssignment,
} from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { ITigerClient } from "@gooddata/api-client-tiger";

type GroupedWorkspacePermissions = { [key: string]: IWorkspacePermissionAssignment[] };

const groupPermissionsById = (permissions: IWorkspacePermissionAssignment[]): GroupedWorkspacePermissions =>
    permissions.reduce((groupedPermissions: GroupedWorkspacePermissions, permission) => {
        const assigneeId = permission.assigneeIdentifier.id;
        if (!groupedPermissions[assigneeId]) {
            groupedPermissions[assigneeId] = [];
        }
        groupedPermissions[assigneeId].push(permission);
        return groupedPermissions;
    }, {});

const getPermissionsByType = (
    type: string,
    permissions: IWorkspacePermissionAssignment[],
): GroupedWorkspacePermissions =>
    groupPermissionsById(permissions.filter((permission) => permission.assigneeIdentifier.type === type));

const mapWorkspaceAssignments = (workspaceAssignments: IWorkspacePermissionAssignment[]) =>
    workspaceAssignments.map(
        ({ workspace, permissions, hierarchyPermissions }: IWorkspacePermissionAssignment) => ({
            id: workspace.id,
            permissions,
            hierarchyPermissions,
        }),
    );

const fetchOrganizationPermissions = async (client: ITigerClient, userId: string) => {
    return client.declarativeLayout
        .getOrganizationPermissions()
        .then((response) => response.data)
        .then((permissions) =>
            permissions
                .filter((permission) => permission.assignee.id === userId)
                .map((permission) => permission.name),
        );
};

export class OrganizationPermissionService implements IOrganizationPermissionService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public getWorkspacePermissionsForUser = async (
        userId: string,
    ): Promise<IWorkspacePermissionAssignment[]> => {
        return this.authCall(async (client) => {
            return client.actions
                .listWorkspacePermissionsForUser({ userId })
                .then((response) => response.data)
                .then((response) =>
                    response.workspaces.map((assignment) => ({
                        assigneeIdentifier: {
                            id: userId,
                            type: "user",
                        },
                        workspace: {
                            id: assignment.id,
                            name: assignment.name,
                        },
                        ...assignment,
                    })),
                );
        });
    };

    public getWorkspacePermissionsForUserGroup = async (
        userGroupId: string,
    ): Promise<IWorkspacePermissionAssignment[]> => {
        return this.authCall(async (client) => {
            return client.actions
                .listWorkspacePermissionsForUserGroup({ userGroupId })
                .then((response) => response.data)
                .then((response) =>
                    response.workspaces.map((assignment) => ({
                        assigneeIdentifier: {
                            id: userGroupId,
                            type: "userGroup",
                        },
                        workspace: {
                            id: assignment.id,
                            name: assignment.name,
                        },
                        ...assignment,
                    })),
                );
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
            await client.actions.manageOrganizationPermissions({
                organizationPermissionAssignment: permissionAssignments,
            });
        });
    };

    public updateWorkspacePermissions = async (
        permissions: IWorkspacePermissionAssignment[],
    ): Promise<void> => {
        return this.authCall(async (client) => {
            const userPermissions = getPermissionsByType("user", permissions);
            const userGroupPermissions = getPermissionsByType("userGroup", permissions);

            // this is not ideal, but this can be replaced when bulk API is created
            await Promise.all([
                ...Object.keys(userPermissions).map((userId) =>
                    client.actions.manageWorkspacePermissionsForUser({
                        userId,
                        workspacePermissionAssignments: {
                            workspaces: mapWorkspaceAssignments(userPermissions[userId]),
                        },
                    }),
                ),
                ...Object.keys(userGroupPermissions).map((userGroupId) =>
                    client.actions.manageWorkspacePermissionsForUserGroup({
                        userGroupId,
                        workspacePermissionAssignments: {
                            workspaces: mapWorkspaceAssignments(userGroupPermissions[userGroupId]),
                        },
                    }),
                ),
            ]);
        });
    };
}
