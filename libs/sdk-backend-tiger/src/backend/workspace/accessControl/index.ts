// (C) 2022-2023 GoodData Corporation
import { IWorkspaceAccessControlService } from "@gooddata/sdk-backend-spi";
import { AssigneeIdentifierTypeEnum, AvailableAssignees } from "@gooddata/api-client-tiger";
import { TigerAuthenticatedCallGuard } from "../../../types";
import {
    ObjRef,
    AccessGranteeDetail,
    GranteeWithGranularPermissions,
    IAvailableAccessGrantee,
} from "@gooddata/sdk-model";
import {
    convertAvailableUser,
    convertAvailableUserGroup,
    convertUserGroupWithPermissions,
    convertUserWithPermissions,
} from "../../../convertors/fromBackend/AccessControlConverter";
import { objRefToIdentifier } from "../../../utils/api";

export class TigerWorkspaceAccessControlService implements IWorkspaceAccessControlService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, private readonly workspace: string) {}

    public async getAccessList(sharedObject: ObjRef): Promise<AccessGranteeDetail[]> {
        const objectId = await objRefToIdentifier(sharedObject, this.authCall);
        const permissions = await this.authCall((client) => {
            return client.actions
                .permissions({ workspaceId: this.workspace, dashboardId: objectId })
                .then((result) => result.data);
        });

        return [
            ...permissions.users.map(convertUserWithPermissions),
            ...permissions.userGroups.map(convertUserGroupWithPermissions),
        ];
    }

    public async grantAccess(
        sharedObject: ObjRef,
        grantees: GranteeWithGranularPermissions[],
    ): Promise<void> {
        return this.changeAccess(sharedObject, grantees);
    }

    public async revokeAccess(
        sharedObject: ObjRef,
        grantees: GranteeWithGranularPermissions[],
    ): Promise<void> {
        return this.changeAccess(sharedObject, grantees);
    }

    public async changeAccess(
        sharedObject: ObjRef,
        grantees: GranteeWithGranularPermissions[],
    ): Promise<void> {
        const objectId = await objRefToIdentifier(sharedObject, this.authCall);
        const permissionsForAssignees = await Promise.all(
            grantees.map(async (grantee) => ({
                assigneeIdentifier: {
                    id: await objRefToIdentifier(grantee.granteeRef, this.authCall),
                    type:
                        grantee.type === "group"
                            ? AssigneeIdentifierTypeEnum.USER_GROUP
                            : AssigneeIdentifierTypeEnum.USER,
                },
                permissions: grantee.permissions,
            })),
        );

        await this.authCall((client) => {
            return client.actions
                .managePermissions({
                    workspaceId: this.workspace,
                    dashboardId: objectId,
                    manageDashboardPermissionsRequest: { permissions: permissionsForAssignees },
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
                .availableAssignes({
                    workspaceId: this.workspace,
                    dashboardId: objectId,
                })
                .then((result) => result.data)
                .then((assignees) => (search ? filterAssignees(assignees, search) : assignees));
        });

        return [
            ...availableGrantees.users.map(convertAvailableUser),
            ...availableGrantees.userGroups.map(convertAvailableUserGroup),
        ];
    }
}

const isNameMatchingSearchString = (title: string, searchString: string) =>
    title?.toLowerCase().indexOf(searchString) > -1;

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
