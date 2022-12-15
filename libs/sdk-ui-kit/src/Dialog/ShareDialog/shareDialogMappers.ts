// (C) 2021-2022 GoodData Corporation
import {
    areObjRefsEqual,
    IUser,
    ObjRef,
    IWorkspaceUser,
    ShareStatus,
    AccessGranteeDetail,
    // IAccessGrantee,
    isUserAccess,
    isUserGroupAccess,
    IUserAccess,
    IUserAccessWithGranularPermissions,
    isAccessWithGranularPermissions,
    IUserGroupAccess,
    IUserGroupAccessWithGranularPermissions,
    IAvailableUserAccessGrantee,
    IAvailableUserGroupAccessGrantee,
    GranteeWithGranularPermissions,
} from "@gooddata/sdk-model";
import { typesUtils } from "@gooddata/util";

import {
    GranteeItem,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranteeUser,
    IGranteeInactiveOwner,
    isGranteeGroupAll,
    isGranteeUserInactive,
    GranteeStatus,
    IAffectedSharedObject,
    isGranteeUser,
    isGranularGranteeUser,
    isGranularGrantee,
    IGranularGranteeUser,
} from "./ShareDialogBase/types";
import { GranteeGroupAll, InactiveOwner, getAppliedGrantees, hasGroupAll } from "./ShareDialogBase/utils";
import { ISharedObject } from "./types";

const mapUserStatusToGranteeStatus = (status: "ENABLED" | "DISABLED"): GranteeStatus => {
    if (status === "DISABLED") {
        return "Inactive";
    }

    return "Active";
};

/**
 * @internal
 */
export const mapWorkspaceUserToGrantee = (
    user: IAvailableUserAccessGrantee,
    currentUserRef: ObjRef,
): IGranteeUser | IGranularGranteeUser => {
    return {
        type: "user",
        id: user.ref,
        name: user.name,
        email: user.email,
        isOwner: false,
        isCurrentUser: areObjRefsEqual(user.ref, currentUserRef),
        status: mapUserStatusToGranteeStatus(user.status),
    };
};

/**
 * @internal
 */
export const mapUserAccessToGrantee = (
    userAccess: IUserAccess | IUserAccessWithGranularPermissions,
    currentUserRef: ObjRef,
): IGranteeUser | IGranularGranteeUser => {
    const { user } = userAccess;
    const permissionsObj = isAccessWithGranularPermissions(userAccess)
        ? {
              permissions: userAccess.permissions,
              inheritedPermissions: userAccess.inheritedPermissions,
          }
        : {};

    return {
        type: "user",
        id: user.ref,
        name: mapUserFullName(user),
        email: user.email,
        isOwner: false,
        isCurrentUser: areObjRefsEqual(user.ref, currentUserRef),
        status: mapUserStatusToGranteeStatus(user.status),
        ...permissionsObj,
    };
};

/**
 * @internal
 */
export const mapWorkspaceUserGroupToGrantee = (
    userGroup: IAvailableUserGroupAccessGrantee,
): IGranteeGroup => {
    return {
        id: userGroup.ref,
        type: "group",
        name: userGroup.name,
    };
};

/**
 * @internal
 */
export const mapUserGroupAccessToGrantee = (
    userGroupAccess: IUserGroupAccess | IUserGroupAccessWithGranularPermissions,
): IGranteeGroup => {
    const { userGroup } = userGroupAccess;
    const permissionsObj = isAccessWithGranularPermissions(userGroupAccess)
        ? {
              permissions: userGroupAccess.permissions,
              inheritedPermissions: userGroupAccess.inheritedPermissions,
          }
        : {};

    return {
        id: userGroup.ref,
        type: "group",
        name: userGroup.name,
        ...permissionsObj,
    };
};

/**
 * @internal
 */
export const mapUserFullName = (user: IUser | IWorkspaceUser): string => {
    if (user.fullName) {
        return user.fullName;
    }

    return `${user.firstName} ${user.lastName}`;
};

/**
 * @internal
 */
export const mapOwnerToGrantee = (user: IUser, currentUserRef: ObjRef): IGranteeUser => {
    return {
        type: "user",
        id: user.ref,
        name: mapUserFullName(user),
        email: user.email,
        isOwner: true,
        isCurrentUser: areObjRefsEqual(user.ref, currentUserRef),
        status: "Active",
    };
};

/**
 * @internal
 */
export const mapUserToInactiveOwner = (): IGranteeInactiveOwner => {
    return InactiveOwner;
};

/**
 * @internal
 */
export const mapShareStatusToGroupAll = (shareStatus: ShareStatus): IGranteeGroupAll | undefined => {
    if (shareStatus === "public") {
        return GranteeGroupAll;
    }
};

/**
 * @internal
 */
// TODO: extend to check if grantee will be added or deleted to handle it on bear
export const mapGranteesToAccessGrantees = (
    grantees: GranteeItem[],
    added?: boolean,
): GranteeWithGranularPermissions[] => {
    const guard = typesUtils.combineGuards(isGranteeGroupAll, isGranteeUserInactive);
    return grantees
        .filter((g) => !guard(g))
        .map((g) => {
            if (isGranularGrantee(g)) {
                const granteeWithGranularPermissions = {
                    granteeRef: g.id,
                    permissions: g.permissions,
                    inheritedPermissions: g.inheritedPermissions,
                };
                if (isGranularGranteeUser(g)) {
                    return {
                        type: "user",
                        ...granteeWithGranularPermissions,
                    };
                } else {
                    return {
                        type: "group",
                        ...granteeWithGranularPermissions,
                    };
                }
            } else {
                if (isGranteeUser(g)) {
                    return {
                        type: "user",
                        granteeRef: g.id,
                        permissions: added ? ["VIEW"] : [],
                        inheritedPermissions: [],
                    };
                } else {
                    return {
                        type: "group",
                        granteeRef: g.id,
                        permissions: added ? ["VIEW"] : [],
                        inheritedPermissions: [],
                    };
                }
            }
        });
};

export const mapAccessGranteeDetailToGrantee = (
    accessGranteeDetail: AccessGranteeDetail,
    currentUserRef: ObjRef,
): GranteeItem => {
    if (isUserAccess(accessGranteeDetail)) {
        return mapUserAccessToGrantee(accessGranteeDetail, currentUserRef);
    } else if (isUserGroupAccess(accessGranteeDetail)) {
        return mapUserGroupAccessToGrantee(accessGranteeDetail);
    }
};

/**
 * @internal
 */
export const mapGranteesToShareStatus = (
    grantees: GranteeItem[],
    granteesToAdd: GranteeItem[],
    granteesToDelete: GranteeItem[],
): ShareStatus => {
    const appliedGrantees = getAppliedGrantees(grantees, granteesToAdd, granteesToDelete);

    if (hasGroupAll(appliedGrantees)) {
        return "public";
    }

    if (appliedGrantees.length > 0) {
        return "shared";
    }

    return "private";
};

/**
 * @internal
 */
export const mapSharedObjectToAffectedSharedObject = (
    sharedObject: ISharedObject,
    owner: IGranteeUser | IGranteeInactiveOwner,
    isLockingSupported: boolean,
    isLeniencyControlSupported: boolean,
    areGranularPermissionsSupported = false,
    isMetadataObjectLockingSupported = true,
): IAffectedSharedObject => {
    const { ref, shareStatus, isLocked, isUnderStrictControl } = sharedObject;
    return {
        ref,
        shareStatus,
        owner,
        isLocked: !!isLocked,
        isUnderLenientControl: !isUnderStrictControl,
        isLockingSupported,
        isLeniencyControlSupported,
        areGranularPermissionsSupported,
        isMetadataObjectLockingSupported,
    };
};
