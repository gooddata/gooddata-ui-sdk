// (C) 2021-2022 GoodData Corporation
import {
    uriRef,
    IWorkspaceUser,
    IWorkspaceUserGroup,
    IUserAccess,
    IUserGroupAccess,
} from "@gooddata/sdk-model";
import { GranteeItem, IGranteeGroup, IGranteeGroupAll, IGranteeUser } from "../types";

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

export const grantees: GranteeItem[] = [user, group];

export const workspaceUser: IWorkspaceUser = {
    ref: uriRef("john-id"),
    uri: "uri",
    login: "john.doe@d.com",
    email: "john.doe@d.com",
    fullName: "John Doe ",
};

export const workSpaceGroup: IWorkspaceUserGroup = {
    ref: uriRef("test-group-id"),
    id: "id",
    name: "Test group",
};

export const userAccessGrantee: IUserAccess = {
    type: "user",
    user: workspaceUser,
};

export const groupAccessGrantee: IUserGroupAccess = {
    type: "group",
    userGroup: workSpaceGroup,
};
