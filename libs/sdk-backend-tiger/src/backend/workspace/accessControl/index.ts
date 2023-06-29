// (C) 2022-2023 GoodData Corporation
import { IWorkspaceAccessControlService } from "@gooddata/sdk-backend-spi";
import { AssigneeIdentifierTypeEnum, AvailableAssignees } from "@gooddata/api-client-tiger";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import {
    ObjRef,
    AccessGranteeDetail,
    IGranularAccessGrantee,
    IAvailableAccessGrantee,
    isGranularUserAccessGrantee,
} from "@gooddata/sdk-model";
import {
    convertUserAssignee,
    convertUserGroupAssignee,
    convertUserPermission,
    convertUserGroupPermission,
} from "../../../convertors/fromBackend/AccessControlConverter.js";
import { objRefToIdentifier } from "../../../utils/api.js";

export class TigerWorkspaceAccessControlService implements IWorkspaceAccessControlService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, private readonly workspace: string) {}

    public async getAccessList(sharedObject: ObjRef): Promise<AccessGranteeDetail[]> {
        const objectId = await objRefToIdentifier(sharedObject, this.authCall);
        const permissions = await this.authCall((client) => {
            return client.actions
                .dashboardPermissions({ workspaceId: this.workspace, dashboardId: objectId })
                .then((result) => result.data);
        });

        return [
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
        const permissionsForAssignee = await Promise.all(
            grantees.map(async (grantee) => ({
                assigneeIdentifier: {
                    id: await objRefToIdentifier(grantee.granteeRef, this.authCall),
                    type: isGranularUserAccessGrantee(grantee)
                        ? AssigneeIdentifierTypeEnum.USER
                        : AssigneeIdentifierTypeEnum.USER_GROUP,
                },
                permissions: grantee.permissions,
            })),
        );

        await this.authCall((client) => {
            return client.actions
                .manageDashboardPermissions({
                    workspaceId: this.workspace,
                    dashboardId: objectId,
                    permissionsForAssignee,
                })
                .then((result) => result.data);
        });
    }

    public async getAvailableGrantees(
        sharedObject: ObjRef,
        search?: string,
    ): Promise<IAvailableAccessGrantee[]> {
        const objectId = await objRefToIdentifier(sharedObject, this.authCall);
        const availableGrantees = await this.authCall((client) => {
            return client.actions
                .availableAssignees({
                    workspaceId: this.workspace,
                    dashboardId: objectId,
                })
                .then((result) => result.data)
                .then((assignees) => (search ? filterAssignees(assignees, search) : assignees));
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
