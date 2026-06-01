// (C) 2026 GoodData Corporation

import {
    type ITigerClientBase,
    type ManageLabelPermissionsRequestInner,
    type UserAssignee,
    type UserGroupAssignee,
    type WorkspaceUser,
    type WorkspaceUserGroup,
} from "@gooddata/api-client-tiger";
import {
    ActionsApi_AttributePermissions,
    ActionsApi_FactPermissions,
    ActionsApi_LabelPermissions,
    ActionsApi_ListWorkspaceUserGroups,
    ActionsApi_ListWorkspaceUsers,
    ActionsApi_ManageAttributePermissions,
    ActionsApi_ManageFactPermissions,
    ActionsApi_ManageLabelPermissions,
} from "@gooddata/api-client-tiger/endpoints/actions";
import { ProfileApi_GetCurrent } from "@gooddata/api-client-tiger/endpoints/profile";
import {
    type IObjectPermissionsObject,
    type IWorkspaceObjectPermissionsService,
} from "@gooddata/sdk-backend-spi";
import {
    type IAvailableAccessGrantee,
    type IGranularAccessGrantee,
    type IObjectAccessList,
    type ObjectPermissionsObjectKind,
    isGranularUserAccessGrantee,
} from "@gooddata/sdk-model";

import {
    convertRulesPermission,
    convertUserAssignee,
    convertUserGroupAssignee,
    convertUserGroupPermission,
    convertUserPermission,
} from "../../../convertors/fromBackend/AccessControlConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";

const PAGE_SIZE = 1000;

export class TigerWorkspaceObjectPermissionsService implements IWorkspaceObjectPermissionsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    public async getAccessList(target: IObjectPermissionsObject): Promise<IObjectAccessList> {
        const objectId = objRefToIdentifier(target.ref, this.authCall);
        const permissions = await this.authCall((client) =>
            fetchPermissionsByKind(client, target.kind, this.workspace, objectId).then(
                (result) => result.data,
            ),
        );

        return {
            grants: [
                ...permissions.rules.map(convertRulesPermission),
                ...permissions.users.map(convertUserPermission),
                ...permissions.userGroups.map(convertUserGroupPermission),
            ],
        };
    }

    public async manageObjectPermissions(
        target: IObjectPermissionsObject,
        grantees: IGranularAccessGrantee[],
    ): Promise<void> {
        const objectId = objRefToIdentifier(target.ref, this.authCall);
        const payload: ManageLabelPermissionsRequestInner[] = grantees.map((grantee) => {
            if (grantee.type === "allWorkspaceUsers") {
                return {
                    assigneeRule: { type: grantee.type },
                    permissions: grantee.permissions,
                };
            }
            return {
                assigneeIdentifier: {
                    id: objRefToIdentifier(grantee.granteeRef, this.authCall),
                    type: isGranularUserAccessGrantee(grantee) ? "user" : "userGroup",
                },
                permissions: grantee.permissions,
            };
        });

        await this.authCall((client) => manageByKind(client, target.kind, this.workspace, objectId, payload));
    }

    public async getAvailableAssignees(
        _target: IObjectPermissionsObject,
    ): Promise<IAvailableAccessGrantee[]> {
        // Composed from workspace-wide user/group lists, filtered to exclude the
        // current user. Admins aren't filtered: the listing endpoints don't
        // expose role information.
        const [currentUserId, users, userGroups] = await Promise.all([
            this.authCall((client) => ProfileApi_GetCurrent(client.axios).then((p) => p.userId)),
            this.fetchAllWorkspaceUsers(),
            this.fetchAllWorkspaceUserGroups(),
        ]);

        return [
            ...users
                .filter((u) => u.id !== currentUserId)
                .map((u) => convertUserAssignee(workspaceUserToAssignee(u))),
            ...userGroups.map((g) => convertUserGroupAssignee(workspaceUserGroupToAssignee(g))),
        ];
    }

    private fetchAllWorkspaceUsers(): Promise<WorkspaceUser[]> {
        return fetchAllPages((page) =>
            this.authCall((client) =>
                ActionsApi_ListWorkspaceUsers(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    page,
                    size: PAGE_SIZE,
                }).then((result) => ({ items: result.data.users, totalCount: result.data.totalCount })),
            ),
        );
    }

    private fetchAllWorkspaceUserGroups(): Promise<WorkspaceUserGroup[]> {
        return fetchAllPages((page) =>
            this.authCall((client) =>
                ActionsApi_ListWorkspaceUserGroups(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    page,
                    size: PAGE_SIZE,
                }).then((result) => ({
                    items: result.data.userGroups,
                    totalCount: result.data.totalCount,
                })),
            ),
        );
    }
}

const fetchAllPages = async <T>(
    fetchPage: (page: number) => Promise<{ items: T[]; totalCount: number }>,
): Promise<T[]> => {
    const first = await fetchPage(0);
    const out = [...first.items];
    const pageCount = Math.ceil(first.totalCount / PAGE_SIZE);
    for (let page = 1; page < pageCount; page++) {
        const next = await fetchPage(page);
        out.push(...next.items);
    }
    return out;
};

const fetchPermissionsByKind = (
    client: ITigerClientBase,
    kind: ObjectPermissionsObjectKind,
    workspaceId: string,
    objectId: string,
) => {
    const { axios, basePath } = client;
    switch (kind) {
        case "attribute":
            return ActionsApi_AttributePermissions(axios, basePath, {
                workspaceId,
                attributeId: objectId,
            });
        case "fact":
            return ActionsApi_FactPermissions(axios, basePath, { workspaceId, factId: objectId });
        case "label":
            return ActionsApi_LabelPermissions(axios, basePath, { workspaceId, labelId: objectId });
    }
};

const manageByKind = (
    client: ITigerClientBase,
    kind: ObjectPermissionsObjectKind,
    workspaceId: string,
    objectId: string,
    manageLabelPermissionsRequestInner: ManageLabelPermissionsRequestInner[],
) => {
    const { axios, basePath } = client;
    switch (kind) {
        case "attribute":
            return ActionsApi_ManageAttributePermissions(axios, basePath, {
                workspaceId,
                attributeId: objectId,
                manageLabelPermissionsRequestInner,
            });
        case "fact":
            return ActionsApi_ManageFactPermissions(axios, basePath, {
                workspaceId,
                factId: objectId,
                manageLabelPermissionsRequestInner,
            });
        case "label":
            return ActionsApi_ManageLabelPermissions(axios, basePath, {
                workspaceId,
                labelId: objectId,
                manageLabelPermissionsRequestInner,
            });
    }
};

// WorkspaceUser and UserAssignee carry the same fields. Same for groups. Pass through
// rather than introduce parallel converters.
const workspaceUserToAssignee = (u: WorkspaceUser): UserAssignee => u;
const workspaceUserGroupToAssignee = (g: WorkspaceUserGroup): UserGroupAssignee => g;
