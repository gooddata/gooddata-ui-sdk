// (C) 2021-2023 GoodData Corporation
import {
    uriRef,
    IWorkspaceUser,
    IWorkspaceUserGroup,
    IUserAccess,
    IUserGroupAccess,
    IAvailableUserAccessGrantee,
    IAvailableUserGroupAccessGrantee,
    IGranularUserAccess,
    IGranularUserGroupAccess,
    AccessGranteeDetail,
} from "@gooddata/sdk-model";
import {
    GranteeItem,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranteeUser,
    IGranularGranteeGroup,
    IGranularGranteeUser,
} from "../types.js";

export const user: IGranteeUser = {
    type: "user",
    id: uriRef("userID1"),
    name: "User Name",
    email: "user.name@gooddata.com",
    isOwner: false,
    isCurrentUser: false,
    status: "Active",
};

export const owner: IGranteeUser = {
    type: "user",
    id: uriRef("userID2"),
    name: "Owner Name",
    email: "owner.name@gooddata.com",
    isOwner: true,
    isCurrentUser: false,
    status: "Active",
};

export const current: IGranteeUser = {
    type: "user",
    id: uriRef("userID3"),
    name: "Current Name",
    email: "current.name@gooddata.com",
    isOwner: false,
    isCurrentUser: true,
    status: "Active",
};

export const group: IGranteeGroup = {
    type: "group",
    id: uriRef("groupId"),
    memberCount: 11,
    name: "TNT team",
};

export const groupAll: IGranteeGroupAll = {
    type: "groupAll",
    id: uriRef("groupAll"),
    memberCount: 11,
};

export const grantees: GranteeItem[] = [user, group];

const userProps = {
    ref: uriRef("john-id"),
    uri: "uri",
    email: "john.doe@d.com",
    name: "John Doe",
};

export const workspaceUser: IWorkspaceUser = {
    ...userProps,
    fullName: userProps.name,
    login: userProps.email,
};

export const defaultUser: IWorkspaceUser = { ...workspaceUser, ref: uriRef(""), login: "" };

export const userAccessGrantee: IUserAccess = {
    type: "user",
    user: workspaceUser,
};

export const availableUserAccessGrantee: IAvailableUserAccessGrantee = {
    ...userProps,
    type: "user",
    status: "ENABLED",
};

const groupProps = {
    ref: uriRef("test-group-id"),
    id: "id",
    name: "Test group",
};

export const workspaceGroup: IWorkspaceUserGroup = {
    ...groupProps,
};

export const groupAccessGrantee: IUserGroupAccess = {
    type: "group",
    userGroup: workspaceGroup,
};

export const availableUserGroupAccessGrantee: IAvailableUserGroupAccessGrantee = {
    ...groupProps,
    type: "group",
};

export const granularUser: IGranularGranteeUser = {
    ...user,
    type: "granularUser",
    permissions: ["VIEW"],
    inheritedPermissions: ["SHARE"],
};

export const granularGroup: IGranularGranteeGroup = {
    ...group,
    type: "granularGroup",
    permissions: ["EDIT"],
    inheritedPermissions: [],
};

export const granularGrantees: GranteeItem[] = [granularUser, granularGroup];

export const granularGranteeUser: IGranularGranteeUser = {
    id: userProps.ref,
    email: userProps.email,
    name: userProps.name,
    type: "granularUser",
    isOwner: false,
    isCurrentUser: false,
    status: "Active",
    permissions: ["VIEW"],
    inheritedPermissions: ["SHARE"],
};

export const granularGranteeUser2: IGranularGranteeUser = {
    id: uriRef("john-id"),
    email: "john.doe2@d.com",
    name: "John Doe2",
    type: "granularUser",
    isOwner: false,
    isCurrentUser: false,
    status: "Active",
    permissions: ["VIEW"],
    inheritedPermissions: [],
};

export const granularGranteeGroup: IGranularGranteeGroup = {
    id: groupProps.ref,
    name: groupProps.name,
    type: "granularGroup",
    permissions: ["EDIT"],
    inheritedPermissions: [],
};

export const granularGranteeItems = [granularGranteeUser, granularGranteeGroup];

export const granularUserAccess: IGranularUserAccess = {
    ...userAccessGrantee,
    type: "granularUser",
    permissions: ["VIEW"],
    inheritedPermissions: ["SHARE"],
};

export const granularUserGroupAccess: IGranularUserGroupAccess = {
    ...groupAccessGrantee,
    type: "granularGroup",
    permissions: ["EDIT"],
    inheritedPermissions: [],
};

export const granularGranteesAccess: AccessGranteeDetail[] = [granularUserAccess, granularUserGroupAccess];
