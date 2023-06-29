// (C) 2021-2023 GoodData Corporation
import {
    IWorkspaceAccessControlService,
    IWorkspaceUserGroupsQueryOptions,
    IWorkspaceUsersQueryOptions,
} from "@gooddata/sdk-backend-spi";
import { objRefToUri } from "../../../utils/api.js";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import {
    ObjRef,
    AccessGranteeDetail,
    IAccessGrantee,
    IAvailableAccessGrantee,
    IGranularAccessGrantee,
} from "@gooddata/sdk-model";
import {
    convertGranteeEntry,
    convertWorkspaceUserGroupToAvailableUserGroupAccessGrantee,
    convertWorkspaceUserToAvailableUserAccessGrantee,
    convertGranularAccessGranteeToAcessGrantee,
} from "../../../convertors/fromBackend/AccessControlConverter.js";
import { BearWorkspaceUsersQuery } from "../users/index.js";
import { BearWorkspaceUserGroupsQuery } from "../userGroups/index.js";

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

    /**
     * Bear has no granular permissions, which means that the user or group either have permissions
     * or they don't. An empty array of grantee permissions will result in revoking the access
     * for the grantee. An array of grantee permissions with some content will result in granting
     * access for the grantee.
     */
    public async changeAccess(sharedObject: ObjRef, grantees: IGranularAccessGrantee[]): Promise<void> {
        const granteesToGrantAccess = grantees
            .filter((grantee) => grantee.permissions.length > 0)
            .map(convertGranularAccessGranteeToAcessGrantee);
        const granteesToRevokeAccess = grantees
            .filter((grantee) => grantee.permissions.length === 0)
            .map(convertGranularAccessGranteeToAcessGrantee);

        if (granteesToGrantAccess.length) {
            await this.grantAccess(sharedObject, granteesToGrantAccess);
        }
        if (granteesToRevokeAccess.length) {
            await this.revokeAccess(sharedObject, granteesToRevokeAccess);
        }
    }

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
