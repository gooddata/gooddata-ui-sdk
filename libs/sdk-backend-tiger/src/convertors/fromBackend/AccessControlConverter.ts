// (C) 2022-2025 GoodData Corporation

import {
    GrantedPermission,
    RulePermission,
    UserAssignee,
    UserGroupAssignee,
    UserGroupPermission,
    UserPermission,
} from "@gooddata/api-client-tiger";
import {
    AccessGranularPermission,
    IAvailableUserAccessGrantee,
    IAvailableUserGroupAccessGrantee,
    IGranularRulesAccess,
    IGranularUserAccess,
    IGranularUserGroupAccess,
    idRef,
} from "@gooddata/sdk-model";

const getPermissionLevels = (permissions: GrantedPermission[] = [], source: "direct" | "indirect") => {
    return permissions
        .filter((permission) => permission.source === source)
        .map((permission) => permission.level as AccessGranularPermission);
};

export const convertRulesPermission = (rule: RulePermission): IGranularRulesAccess => ({
    type: "allWorkspaceUsers",
    permissions: getPermissionLevels(rule.permissions, "direct"),
    inheritedPermissions: getPermissionLevels(rule.permissions, "indirect"),
});

export const convertUserPermission = (user: UserPermission): IGranularUserAccess => ({
    type: "granularUser",
    user: {
        ref: idRef(user.id),
        uri: user.id,
        email: user.email ?? user.id,
        login: user.email ?? user.id,
        fullName: user.name ?? user.email ?? user.id,
    },
    permissions: getPermissionLevels(user.permissions, "direct"),
    inheritedPermissions: getPermissionLevels(user.permissions, "indirect"),
});

export const convertUserGroupPermission = (group: UserGroupPermission): IGranularUserGroupAccess => ({
    type: "granularGroup",
    userGroup: { ref: idRef(group.id), name: group.name ?? group.id },
    permissions: getPermissionLevels(group.permissions, "direct"),
    inheritedPermissions: getPermissionLevels(group.permissions, "indirect"),
});

export const convertUserAssignee = (user: UserAssignee): IAvailableUserAccessGrantee => ({
    type: "user",
    ref: idRef(user.id),
    name: user.name ?? user.email ?? user.id,
    status: "ENABLED",
});

export const convertUserGroupAssignee = (group: UserGroupAssignee): IAvailableUserGroupAccessGrantee => ({
    type: "group",
    ref: idRef(group.id),
    name: group.name ?? group.id,
});
