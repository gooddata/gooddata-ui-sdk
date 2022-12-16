// (C) 2021-2022 GoodData Corporation
import { GdcAccessControl } from "@gooddata/api-model-bear";

import { convertWorkspaceUserGroup } from "./UserGroupsConverter";
import { convertUsersItem } from "./UsersConverter";
import {
    AccessGranteeDetail,
    GranteeWithGranularPermissions,
    IAvailableUserAccessGrantee,
    IAvailableUserGroupAccessGrantee,
    IWorkspaceUser,
    IWorkspaceUserGroup,
    IAccessGrantee,
} from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

function isGranteeUserInfo(
    grantee: GdcAccessControl.IGranteeUserInfo | GdcAccessControl.IGranteeUserGroupInfo,
): grantee is GdcAccessControl.IGranteeUserInfo {
    return !isEmpty(grantee) && (grantee as GdcAccessControl.IGranteeUserInfo).user !== undefined;
}

export const convertGranteeEntry = (item: GdcAccessControl.IGranteeEntry): AccessGranteeDetail => {
    if (isGranteeUserInfo(item.aclEntry.grantee)) {
        return {
            type: "user",
            user: convertUsersItem(item.aclEntry.grantee.user),
        };
    } else {
        return {
            type: "group",
            userGroup: convertWorkspaceUserGroup(item.aclEntry.grantee.userGroup),
        };
    }
};

export const mapUserFullName = (user: IWorkspaceUser): string => {
    if (user.fullName) {
        return user.fullName;
    }

    return `${user.firstName} ${user.lastName}`;
};

export const convertWorkspaceUserToAvailableUserAccessGrantee = (
    user: IWorkspaceUser,
): IAvailableUserAccessGrantee => ({
    type: "user",
    ref: user.ref,
    name: mapUserFullName(user),
    email: user.email,
    status: user.status ?? "DISABLED", // TODO: is this ok?
});

export const convertWorkspaceUserGroupToAvailableUserGroupAccessGrantee = (
    group: IWorkspaceUserGroup,
): IAvailableUserGroupAccessGrantee => ({
    type: "group",
    ref: group.ref,
    name: group.name ?? "", // TODO: is this ok?
});

export const removePermissionsFromGrantee = (grantee: GranteeWithGranularPermissions): IAccessGrantee => {
    // TODO: is there other way to do this? probably check if needed
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { permissions, inheritedPermissions, ...rest } = grantee;

    return rest;
};
