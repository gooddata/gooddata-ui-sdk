// (C) 2021-2023 GoodData Corporation
import {
    areObjRefsEqual,
    IUser,
    ObjRef,
    IWorkspaceUser,
    ShareStatus,
    IWorkspaceUserGroup,
    AccessGranteeDetail,
    IAccessGrantee,
    isUserAccess,
    isUserGroupAccess,
    IUserGroupAccessGrantee,
    IUserAccessGrantee,
    GranularGrantee,
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
    isGranularGrantee,
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
export const mapWorkspaceUserToGrantee = (user: IWorkspaceUser, currentUserRef: ObjRef): IGranteeUser => {
    return {
        type: "user",
        id: user.ref,
        name: mapUserFullName(user),
        email: user.email,
        isOwner: false,
        isCurrentUser: areObjRefsEqual(user.ref, currentUserRef),
        status: mapUserStatusToGranteeStatus(user.status),
    };
};

/**
 * @internal
 */
export const mapWorkspaceUserGroupToGrantee = (userGroup: IWorkspaceUserGroup): IGranteeGroup => {
    return {
        id: userGroup.ref,
        type: "group",
        name: userGroup.name,
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
export const mapGranteesToAccessGrantees = (grantees: GranteeItem[]): IAccessGrantee[] => {
    const guard = typesUtils.combineGuards(isGranteeGroupAll, isGranteeUserInactive);
    return grantees
        .filter((g) => !guard(g))
        .map((g) => {
            const type = isGranteeUser(g) ? "user" : "group";
            if (isGranularGrantee(g)) {
                const grantee: GranularGrantee = {
                    type,
                    granteeRef: g.id,
                    permissions: g.permissions,
                    inheritedPermissions: g.inheritedPermissions,
                };
                return grantee;
            } else {
                const grantee: IUserGroupAccessGrantee | IUserAccessGrantee = {
                    type,
                    granteeRef: g.id,
                };
                return grantee;
            }
        });
};

export const mapAccessGranteeDetailToGrantee = (
    accessGranteeDetail: AccessGranteeDetail,
    currentUserRef: ObjRef,
): GranteeItem => {
    if (isUserAccess(accessGranteeDetail)) {
        return mapWorkspaceUserToGrantee(accessGranteeDetail.user, currentUserRef);
    } else if (isUserGroupAccess(accessGranteeDetail)) {
        return mapWorkspaceUserGroupToGrantee(accessGranteeDetail.userGroup);
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
    };
};
