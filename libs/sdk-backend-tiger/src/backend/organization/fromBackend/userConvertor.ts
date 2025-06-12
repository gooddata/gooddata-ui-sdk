// (C) 2023-2024 GoodData Corporation

import {
    IUser,
    IUserGroup,
    IOrganizationUser,
    IOrganizationUserGroup,
    idRef,
    IWorkspacePermissionAssignment,
    IDataSourcePermissionAssignment,
    IWorkspaceUser,
} from "@gooddata/sdk-model";
import {
    JsonApiUserOutDocument,
    JsonApiUserGroupOutDocument,
    JsonApiUserGroupOutWithLinks,
    JsonApiUserOutWithLinks,
    UserManagementUsersItem,
    UserManagementUserGroupsItem,
    UserManagementWorkspacePermissionAssignment,
    UserManagementDataSourcePermissionAssignment,
    UserGroupIdentifier,
    WorkspaceUser,
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

export const convertWorkspaceUser = (user: WorkspaceUser): IWorkspaceUser => {
    const fullName = user.name;
    const email = user.email ?? "";
    return {
        ref: idRef(user.id),
        uri: user.id,
        login: user.id,
        email,
        fullName,
    };
};

export const convertUserGroup = (userGroup: JsonApiUserGroupOutDocument): IUserGroup => ({
    ref: idRef(userGroup.data.id),
    id: userGroup.data.id,
    name: userGroup.data.attributes?.name,
});

export const convertUserGroupIdentifier = (userGroup: UserGroupIdentifier): IUserGroup => {
    return {
        ref: idRef(userGroup.id),
        id: userGroup.id,
        name: userGroup.name,
    };
};

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
    ref: idRef(user.id),
    id: user.id,
    email: user.email,
    fullName: user.name,
    isOrganizationAdmin: user.organizationAdmin,
    assignedUserGroups: user.userGroups.map(convertUserGroupIdentifier),
    assignedWorkspaces: user.workspaces.map((ws) =>
        convertWorkspacePermissionsAssignment(user.id, "user", ws),
    ),
    assignedDataSources: user.dataSources.map((ds) =>
        convertDataSourcePermissionsAssignment(user.id, "user", ds),
    ),
});

export const convertOrganizationUserGroup = (
    userGroup: UserManagementUserGroupsItem,
): IOrganizationUserGroup => ({
    ref: idRef(userGroup.id),
    id: userGroup.id,
    name: userGroup.name,
    isOrganizationAdmin: userGroup.organizationAdmin,
    assignedUsersCount: userGroup.userCount,
    assignedWorkspaces: userGroup.workspaces.map((ws) =>
        convertWorkspacePermissionsAssignment(userGroup.id, "userGroup", ws),
    ),
    assignedDataSources: userGroup.dataSources.map((ds) =>
        convertDataSourcePermissionsAssignment(userGroup.id, "userGroup", ds),
    ),
});

export function convertWorkspacePermissionsAssignment(
    id: string,
    subjectType: "user" | "userGroup",
    assignment: UserManagementWorkspacePermissionAssignment,
): IWorkspacePermissionAssignment {
    return {
        assigneeIdentifier: {
            id,
            type: subjectType,
        },
        workspace: {
            id: assignment.id,
            name: assignment.name,
        },
        ...assignment,
    };
}

export function convertDataSourcePermissionsAssignment(
    id: string,
    subjectType: "user" | "userGroup",
    assignment: UserManagementDataSourcePermissionAssignment,
): IDataSourcePermissionAssignment {
    return {
        assigneeIdentifier: {
            id,
            type: subjectType,
        },
        dataSource: {
            id: assignment.id,
            name: assignment.name,
        },
        ...assignment,
    };
}
