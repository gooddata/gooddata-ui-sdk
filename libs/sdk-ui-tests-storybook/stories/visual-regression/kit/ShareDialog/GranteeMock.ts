// (C) 2021-2026 GoodData Corporation

import { type IWorkspaceUser, uriRef } from "@gooddata/sdk-model";
import {
    type CurrentUserPermissions,
    type GranteeItem,
    type IGranteeGroup,
    type IGranteeGroupAll,
    type IGranteeInactiveOwner,
    type IGranteeUser,
    type IGranularGranteeGroup,
    type IGranularGranteeUser,
} from "@gooddata/sdk-ui-kit";

export const defaultUserPermissions: CurrentUserPermissions = {
    canEditAffectedObject: true,
    canEditLockedAffectedObject: true,
    canShareAffectedObject: true,
    canShareLockedAffectedObject: true,
    canViewAffectedObject: true,
};

export const defaultUser: IWorkspaceUser = {
    ref: uriRef("john-uri"),
    uri: "uri",
    email: "john.doe@d.com",
    fullName: "John Doe",
    login: "john-id",
};

export const user: IGranteeUser = {
    type: "user",
    id: uriRef("userID1"),
    name: "User Name",
    email: "user.name@gooddata.com",
    isOwner: false,
    isCurrentUser: false,
    status: "Active",
};

export const userInactive: IGranteeUser = {
    type: "user",
    id: uriRef("userID1"),
    name: "User Name",
    email: "user.name@gooddata.com",
    isOwner: false,
    isCurrentUser: false,
    status: "Inactive",
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

export const currentAndOwen: IGranteeUser = {
    type: "user",
    id: uriRef("userID4"),
    name: "Owner Current Name",
    email: "owner.current.name@gooddata.com",
    isOwner: true,
    isCurrentUser: true,
    status: "Active",
};

export const group: IGranteeGroup = {
    type: "group",
    id: uriRef("groupId"),
    memberCount: 11,
    name: "TNT team",
};

export const groupNoCount: IGranteeGroup = {
    type: "group",
    id: uriRef("groupId"),
    name: "TNT team",
};

export const groupAll: IGranteeGroupAll = {
    type: "groupAll",
    id: uriRef("groupAll"),
    memberCount: 11,
};

export const inactiveUser: IGranteeInactiveOwner = {
    type: "inactive_owner",
    id: uriRef("inactive_user"),
};

export const granularUser: IGranularGranteeUser = {
    type: "granularUser",
    id: uriRef("userID1"),
    name: "User Name",
    email: "user.name@gooddata.com",
    permissions: ["VIEW"],
    isCurrentUser: false,
    isOwner: true,
    inheritedPermissions: ["SHARE"],
    status: "Active",
};

export const granularGroup: IGranularGranteeGroup = {
    type: "granularGroup",
    id: uriRef("userID1"),
    name: "Group Name",
    permissions: ["EDIT"],
    inheritedPermissions: [],
};

export const grantees: GranteeItem[] = [user, group];

export const granularGrantees: GranteeItem[] = [granularUser, granularGroup];
