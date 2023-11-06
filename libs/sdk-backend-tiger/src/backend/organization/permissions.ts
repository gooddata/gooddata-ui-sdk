// (C) 2023 GoodData Corporation

import { IOrganizationPermissionService } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissionAssignment } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../types/index.js";

export class OrganizationPermissionService implements IOrganizationPermissionService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public getWorkspacePermissionsForUser = async (
        userId: string,
    ): Promise<IWorkspacePermissionAssignment[]> => {
        return this.authCall(async (client) => {
            return client.actions
                .getWorkspacePermissionsForUser({ userId })
                .then((response) => response.data)
                .then((response) => response.assignments);
        });
    };

    public getWorkspacePermissionsForUserGroup = async (
        userGroupId: string,
    ): Promise<IWorkspacePermissionAssignment[]> => {
        return this.authCall(async (client) => {
            return client.actions
                .getWorkspacePermissionsForUserGroup({ userGroupId })
                .then((response) => response.data)
                .then((response) => response.assignments);
        });
    };

    public updateUserOrganizationAdminStatus = async (
        _userId: string,
        _isOrganizationAdmin: boolean,
    ): Promise<void> => {
        return this.authCall(async (_client) => {
            // TODO use new API that is in master when this commit is cherry picked onto master branch
        });
    };

    public updateWorkspacePermissionsForUser = async (
        userId: string,
        permissions: IWorkspacePermissionAssignment[],
    ): Promise<void> => {
        return this.authCall(async (client) => {
            await client.actions.manageWorkspacePermissionsForUser({
                userId,
                workspacePermissionAssignments: { assignments: permissions },
            });
        });
    };

    public updateWorkspacePermissionsForUserGroup = async (
        userGroupId: string,
        permissions: IWorkspacePermissionAssignment[],
    ): Promise<void> => {
        return this.authCall(async (client) => {
            await client.actions.manageWorkspacePermissionsForUserGroup({
                userGroupId,
                workspacePermissionAssignments: { assignments: permissions },
            });
        });
    };
}
