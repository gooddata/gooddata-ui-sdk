// (C) 2021-2022 GoodData Corporation
import {
    IWorkspaceAccessControlService,
    IWorkspaceUserGroupsQueryOptions,
    IWorkspaceUsersQueryOptions,
} from "@gooddata/sdk-backend-spi";
import { objRefToUri } from "../../../utils/api";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import {
    ObjRef,
    AccessGranteeDetail,
    IAccessGrantee,
    IAvailableAccessGrantee,
    GranteeWithGranularPermissions,
} from "@gooddata/sdk-model";
import {
    convertGranteeEntry,
    convertWorkspaceUserGroupToAvailableUserGroupAccessGrantee,
    convertWorkspaceUserToAvailableUserAccessGrantee,
} from "../../../convertors/fromBackend/AccessControlConverter";
import { BearWorkspaceUsersQuery } from "../users";
import { BearWorkspaceUserGroupsQuery } from "../userGroups";

export class BearWorkspaceAccessControlService implements IWorkspaceAccessControlService {
    private users: BearWorkspaceUsersQuery;
    private userGroups: BearWorkspaceUserGroupsQuery;

    constructor(private readonly authCall: BearAuthenticatedCallGuard, private readonly workspace: string) {
        this.users = new BearWorkspaceUsersQuery(this.authCall, this.workspace);
        this.userGroups = new BearWorkspaceUserGroupsQuery(this.authCall, this.workspace);
    }

    public async getAccessList(sharedObject: ObjRef): Promise<AccessGranteeDetail[]> {
        const objectUri = await objRefToUri(sharedObject, this.workspace, this.authCall);
        const granteesList = await this.authCall((sdk) => sdk.project.getGranteesInfo(objectUri, {}));
        const {
            grantees: { items },
        } = granteesList;
        return items.map(convertGranteeEntry);
    }

    public async grantAccess(sharedObject: ObjRef, grantees: IAccessGrantee[]): Promise<void> {
        const objectUri = await objRefToUri(sharedObject, this.workspace, this.authCall);
        const granteeUris = await Promise.all(
            grantees.map((grantee) => objRefToUri(grantee.granteeRef, this.workspace, this.authCall)),
        );
        return this.authCall((sdk) => sdk.project.addGrantees(objectUri, granteeUris));
    }

    public async revokeAccess(sharedObject: ObjRef, grantees: IAccessGrantee[]): Promise<void> {
        const objectUri = await objRefToUri(sharedObject, this.workspace, this.authCall);
        const granteeUris = await Promise.all(
            grantees.map((grantee) => objRefToUri(grantee.granteeRef, this.workspace, this.authCall)),
        );
        return this.authCall((sdk) => sdk.project.removeGrantees(objectUri, granteeUris));
    }

    // TODO: TNT-1185 Implement method
    public async changeAccess(
        _sharedObject: ObjRef,
        _grantees: GranteeWithGranularPermissions[],
    ): Promise<void> {
        return Promise.resolve();
    }

    // TODO: TNT-1185 Implement method
    public async getAvailableGrantees(
        _sharedObject: ObjRef,
        search?: string,
    ): Promise<IAvailableAccessGrantee[]> {
        let usersOption: IWorkspaceUsersQueryOptions = {};
        let groupsOption: IWorkspaceUserGroupsQueryOptions = {};

        if (search) {
            usersOption = { ...usersOption, search: `%${search}` };
            groupsOption = { ...groupsOption, search: `${search}` };
        }

        const workspaceUsersQuery = this.users.withOptions(usersOption).query();
        const workspaceGroupsQuery = this.userGroups.query(groupsOption);

        const [users, groups] = await Promise.all([workspaceUsersQuery, workspaceGroupsQuery]);

        return [
            ...users.items.map(convertWorkspaceUserToAvailableUserAccessGrantee),
            ...groups.items.map(convertWorkspaceUserGroupToAvailableUserGroupAccessGrantee),
        ];
    }
}
