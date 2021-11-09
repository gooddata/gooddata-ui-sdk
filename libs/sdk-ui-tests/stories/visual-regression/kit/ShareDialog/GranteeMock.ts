// (C) 2021 GoodData Corporation
import { uriRef } from "@gooddata/sdk-model";
import {
    GranteeItem,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranteeUser,
    IGranteeUserInactive,
} from "@gooddata/sdk-ui-kit";

export const user: IGranteeUser = {
    type: "user",
    id: uriRef("userID1"),
    name: "User Name",
    email: "user.name@gooddata.com",
    isOwner: false,
    isCurrentUser: false,
};

export const owner: IGranteeUser = {
    type: "user",
    id: uriRef("userID2"),
    name: "Owner Name",
    email: "owner.name@gooddata.com",
    isOwner: true,
    isCurrentUser: false,
};

export const current: IGranteeUser = {
    type: "user",
    id: uriRef("userID3"),
    name: "Current Name",
    email: "current.name@gooddata.com",
    isOwner: false,
    isCurrentUser: true,
};

export const currentAndOwen: IGranteeUser = {
    type: "user",
    id: uriRef("userID4"),
    name: "Owner Current Name",
    email: "owner.current.name@gooddata.com",
    isOwner: true,
    isCurrentUser: true,
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

export const inactiveUser: IGranteeUserInactive = {
    type: "inactive_user",
    id: uriRef("inactive_user"),
};

export const grantees: GranteeItem[] = [user, group];
