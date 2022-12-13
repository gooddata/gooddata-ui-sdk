// (C) 2022 GoodData Corporation

import {
    idRef,
    IAccessGranularPermission,
    IAvailableUserAccessGrantee,
    IAvailableUserGroupAccessGrantee,
    IUserAccessWithGranularPermissions,
    IUserGroupAccessWithGranularPermissions,
} from "@gooddata/sdk-model";

interface IPermission {
    level: string;
    source: string;
}

interface IUserWithPermissions {
    id: string;
    name?: string;
    email?: string;
    permissions: IPermission[];
}

interface IUserGroupWithPermissions {
    id: string;
    name?: string;
    permissions: IPermission[];
}

const getPermissionLevels = (permissions: IPermission[], source: "direct" | "indirect") => {
    return permissions
        .filter((permission) => permission.source === source)
        .map((permission) => permission.level as IAccessGranularPermission);
};

export const convertUserWithPermissions = (
    user: IUserWithPermissions,
): IUserAccessWithGranularPermissions => ({
    type: "user",
    user: {
        ref: idRef(user.id),
        uri: user.id,
        email: user.email ?? user.id, // TODO: is this ok?
        login: user.email ?? user.id, // TODO: is this ok?
        fullName: user.name ?? user.id, // TODO: is this ok?
    },
    permissions: getPermissionLevels(user.permissions, "direct"),
    inheritedPermissions: getPermissionLevels(user.permissions, "indirect"),
});

export const convertUserGroupWithPermissions = (
    group: IUserGroupWithPermissions,
): IUserGroupAccessWithGranularPermissions => ({
    type: "group",
    userGroup: { ref: idRef(group.id), name: group.name ?? group.id },
    permissions: getPermissionLevels(group.permissions, "direct"),
    inheritedPermissions: getPermissionLevels(group.permissions, "indirect"),
});

interface IAvailableUser {
    id: string;
    name?: string;
    email?: string;
}

interface IAvailableUserGroup {
    id: string;
    name?: string;
}

export const convertAvailableUser = (user: IAvailableUser): IAvailableUserAccessGrantee => ({
    type: "user",
    ref: idRef(user.id),
    name: user.name ?? user.id,
    status: "ENABLED",
});

export const convertAvailableUserGroup = (group: IAvailableUserGroup): IAvailableUserGroupAccessGrantee => ({
    type: "group",
    ref: idRef(group.id),
    name: group.name ?? group.id,
});
