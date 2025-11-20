// (C) 2022-2025 GoodData Corporation

import { AvailableAssignees, ManageDashboardPermissionsRequestInner } from "@gooddata/api-client-tiger";
import {
    ActionsApi_AvailableAssignees,
    ActionsApi_DashboardPermissions,
    ActionsApi_ManageDashboardPermissions,
} from "@gooddata/api-client-tiger/actions";
import { IWorkspaceAccessControlService } from "@gooddata/sdk-backend-spi";
import {
    AccessGranteeDetail,
    IAvailableAccessGrantee,
    IGranularAccessGrantee,
    ObjRef,
    isGranularUserAccessGrantee,
} from "@gooddata/sdk-model";

import {
    convertRulesPermission,
    convertUserAssignee,
    convertUserGroupAssignee,
    convertUserGroupPermission,
    convertUserPermission,
} from "../../../convertors/fromBackend/AccessControlConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";

export class TigerWorkspaceAccessControlService implements IWorkspaceAccessControlService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    public async getAccessList(sharedObject: ObjRef): Promise<AccessGranteeDetail[]> {
        const objectId = await objRefToIdentifier(sharedObject, this.authCall);
        const permissions = await this.authCall((client) => {
            return ActionsApi_DashboardPermissions(client.axios, client.basePath, {
                workspaceId: this.workspace,
                dashboardId: objectId,
            }).then((result: any) => result.data);
        });

        return [
            ...permissions.rules.map(convertRulesPermission),
            ...permissions.users.map(convertUserPermission),
            ...permissions.userGroups.map(convertUserGroupPermission),
        ];
    }

    public async grantAccess(sharedObject: ObjRef, grantees: IGranularAccessGrantee[]): Promise<void> {
        return this.changeAccess(sharedObject, grantees);
    }

    public async revokeAccess(sharedObject: ObjRef, grantees: IGranularAccessGrantee[]): Promise<void> {
        const granteesToRevokeAccess = grantees.map((grantee) => ({
            ...grantee,
            permissions: [],
        }));

        return this.changeAccess(sharedObject, granteesToRevokeAccess);
    }

    public async changeAccess(sharedObject: ObjRef, grantees: IGranularAccessGrantee[]): Promise<void> {
        const objectId = await objRefToIdentifier(sharedObject, this.authCall);
        //ivec investigate
        const manageDashboardPermissionsRequestInner: ManageDashboardPermissionsRequestInner[] =
            await Promise.all(
                grantees.map(async (grantee) => {
                    if (grantee.type === "allWorkspaceUsers") {
                        return {
                            assigneeRule: {
                                type: grantee.type,
                            },
                            permissions: grantee.permissions,
                        };
                    }
                    return {
                        assigneeIdentifier: {
                            id: await objRefToIdentifier(grantee.granteeRef, this.authCall),
                            type: isGranularUserAccessGrantee(grantee) ? "user" : "userGroup",
                        },
                        permissions: grantee.permissions,
                    };
                }),
            );

        await this.authCall((client) => {
            return ActionsApi_ManageDashboardPermissions(client.axios, client.basePath, {
                workspaceId: this.workspace,
                dashboardId: objectId,
                manageDashboardPermissionsRequestInner,
            }).then((result: any) => result.data);
        });
    }

    public async getAvailableGrantees(
        sharedObject: ObjRef,
        search?: string,
    ): Promise<IAvailableAccessGrantee[]> {
        const objectId = await objRefToIdentifier(sharedObject, this.authCall);
        const availableGrantees = await this.authCall((client) => {
            return ActionsApi_AvailableAssignees(client.axios, client.basePath, {
                workspaceId: this.workspace,
                dashboardId: objectId,
            })
                .then((result: any) => result.data)
                .then((assignees: AvailableAssignees) =>
                    search ? filterAssignees(assignees, search) : assignees,
                );
        });

        return [
            ...availableGrantees.users.map(convertUserAssignee),
            ...availableGrantees.userGroups.map(convertUserGroupAssignee),
        ];
    }
}

const isNameMatchingSearchString = (name: string, searchString: string) =>
    name?.toLowerCase().indexOf(searchString) > -1;

const filterAssignees = (grantees: AvailableAssignees, search: string) => {
    const lowercaseSearch = search.toLocaleLowerCase();
    const { users, userGroups } = grantees;

    const filteredUsers = users.filter(({ name, id }) =>
        isNameMatchingSearchString(name ?? id, lowercaseSearch),
    );
    const filteredUserGroups = userGroups.filter(({ name, id }) =>
        isNameMatchingSearchString(name ?? id, lowercaseSearch),
    );

    return {
        users: filteredUsers,
        userGroups: filteredUserGroups,
    };
};
