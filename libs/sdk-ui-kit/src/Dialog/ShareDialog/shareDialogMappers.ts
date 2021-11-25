// (C) 2021 GoodData Corporation
import { areObjRefsEqual, IUser, ObjRef } from "@gooddata/sdk-model";
import {
    GranteeItem,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranteeUser,
    IGranteeInactiveOwner,
    isGranteeGroupAll,
    isGranteeUserInactive,
    GranteeStatus,
} from "./ShareDialogBase/types";
import {
    AccessGranteeDetail,
    IAccessGrantee,
    IWorkspaceUser,
    IWorkspaceUserGroup,
    ShareStatus,
} from "@gooddata/sdk-backend-spi";
import { GranteeGroupAll, InactiveOwner, getAppliedGrantees, hasGroupAll } from "./ShareDialogBase/utils";
import { typesUtils } from "@gooddata/util";
import { isUserAccess, isUserGroupAccess } from "@gooddata/sdk-backend-spi";

const mapUserStatusToGranteeStatus = (status: "ENABLED" | "DISABLED"): GranteeStatus => {
    if (status === "DISABLED") {
        return "Inactive";
    }

    return "Active";
};

/**
 * @internal
 */
export const mapWorkspaceUserToGrantee = (user: IWorkspaceUser): IGranteeUser => {
    return {
        type: "user",
        id: user.ref,
        name: mapUserFullName(user),
        email: user.email,
        isOwner: false,
        isCurrentUser: false,
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
            return {
                granteeRef: g.id,
            };
        });
};

export const mapAccessGranteeDetailToGrantee = (accessGranteeDetail: AccessGranteeDetail): GranteeItem => {
    if (isUserAccess(accessGranteeDetail)) {
        return mapWorkspaceUserToGrantee(accessGranteeDetail.user);
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
