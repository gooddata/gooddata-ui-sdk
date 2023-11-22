// (C) 2023 GoodData Corporation

import { IUser, IUserGroup, IOrganizationUser, IOrganizationUserGroup, idRef } from "@gooddata/sdk-model";
import {
    JsonApiUserOutDocument,
    JsonApiUserGroupOutDocument,
    JsonApiUserGroupOutWithLinks,
    JsonApiUserOutWithLinks,
    UserManagementUsersItem,
    UserManagementUserGroupsItem,
} from "@gooddata/api-client-tiger";

const constructFullName = (firstName?: string, lastName?: string) =>
    firstName || lastName
        ? `${firstName || ""}${firstName && lastName ? " " : ""}${lastName || ""}`
        : undefined;

export const convertUser = (user: JsonApiUserOutDocument): IUser => {
    const firstName = user.data.attributes?.firstname;
    const lastName = user.data.attributes?.lastname;
    const email = user.data.attributes?.email ?? "";
    return {
        ref: idRef(user.data.id),
        login: user.data.id,
        email,
        fullName: constructFullName(firstName, lastName),
        firstName,
        lastName,
    };
};

export const convertUserGroup = (userGroup: JsonApiUserGroupOutDocument): IUserGroup => ({
    ref: idRef(userGroup.data.id),
    id: userGroup.data.id,
    name: userGroup.data.attributes?.name,
});

export const convertIncludedUserGroup = (group: JsonApiUserGroupOutWithLinks): IUserGroup => ({
    ref: idRef(group.id),
    id: group.id,
    name: group.attributes?.name,
});

export const convertIncludedUser = (user: JsonApiUserOutWithLinks): IUser => {
    const firstName = user.attributes?.firstname;
    const lastName = user.attributes?.lastname;
    return {
        ref: idRef(user.id),
        login: user.id,
        email: user.attributes?.email ?? "",
        fullName: constructFullName(firstName, lastName),
        firstName,
        lastName,
    };
};

export const convertOrganizationUser = (user: UserManagementUsersItem): IOrganizationUser => ({
    ref: idRef(user.userId),
    id: user.userId,
    email: user.email,
    fullName: user.name,
    isOrganizationAdmin: user.organizationAdmin,
    assignedUserGroupIds: user.groups,
    assignedWorkspaceIds: user.workspaces,
});

export const convertOrganizationUserGroup = (
    userGroup: UserManagementUserGroupsItem,
): IOrganizationUserGroup => ({
    ref: idRef(userGroup.groupId),
    id: userGroup.groupId,
    name: userGroup.name,
    isOrganizationAdmin: userGroup.organizationAdmin,
    assignedUsersCount: userGroup.userCount,
    assignedWorkspaceIds: userGroup.workspaces,
});
