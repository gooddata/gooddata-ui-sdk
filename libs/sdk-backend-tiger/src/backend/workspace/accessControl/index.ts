// (C) 2022 GoodData Corporation
import { IWorkspaceAccessControlService } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types";
import {
    ObjRef,
    AccessGranteeDetail,
    IAvailableAccessGrantee,
    GranteeWithGranularPermissions,
} from "@gooddata/sdk-model";
import {
    convertUserGroupWithPermissions,
    convertUserWithPermissions,
} from "../../../convertors/fromBackend/AccessControlConverter";

const dummyPermissions = {
    users: [
        {
            id: "john-unreadableId",
            name: "John Doe",
            email: "john@company.com",
            permissions: [
                {
                    level: "VIEW",
                    source: "indirect",
                },
                {
                    level: "SHARE",
                    source: "direct",
                },
            ],
        },
        {
            id: "mary-unreadableId",
            name: "Mary Sue",
            email: "mary@company.com",
            permissions: [
                {
                    level: "EDIT",
                    source: "indirect",
                },
                {
                    level: "EDIT",
                    source: "direct",
                },
            ],
        },
    ],
    userGroups: [
        {
            id: "parent-group-unreadableId",
            name: "group A",
            permissions: [
                {
                    level: "VIEW",
                    source: "direct",
                },
            ],
        },
        {
            id: "child-group-unreadableId",
            name: "group B",
            permissions: [
                {
                    level: "EDIT",
                    source: "direct",
                },
            ],
        },
    ],
};

export class TigerWorkspaceAccessControlService implements IWorkspaceAccessControlService {
    // @ts-expect-error TODO: TNT-1185 Remove this line when properties are used
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, private readonly workspace: string) {}

    // TODO: TNT-1185 Implement method
    public async getAccessList(_sharedObject: ObjRef): Promise<AccessGranteeDetail[]> {
        // GET /api/v1/actions/workspaces/{workspaceId}/dashboards/{dashboardId}/permissions
        const dashboardPermissions = await Promise.resolve(dummyPermissions);
        return [
            ...dashboardPermissions.users.map(convertUserWithPermissions),
            ...dashboardPermissions.userGroups.map(convertUserGroupWithPermissions),
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
        _search?: string,
    ): Promise<IAvailableAccessGrantee[]> {
        return Promise.resolve([]);
    }
}
