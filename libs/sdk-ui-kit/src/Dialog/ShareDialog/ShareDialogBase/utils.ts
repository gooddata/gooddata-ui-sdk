// (C) 2021-2025 GoodData Corporation
import { IntlShape } from "react-intl";
import {
    AccessGranularPermission,
    areObjRefsEqual,
    idRef,
    IUser,
    ObjRef,
    objRefToString,
    uriRef,
} from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import {
    GranteeItem,
    IGranteeRules,
    IGranteeGroupAll,
    IGranteeInactiveOwner,
    isGranteeRules,
    isGranteeGroup,
    isGranteeGroupAll,
    isGranularGranteeGroup,
} from "./types.js";
import differenceWith from "lodash/differenceWith.js";
import partition from "lodash/partition.js";
import { CurrentUserPermissions } from "../types.js";

/**
 * @internal
 */
export const ADD_GRANTEE_ID = "add-grantee-id";

/**
 * @internal
 */
export const ADD_GRANTEE_SELECT_ID = "add-grantee-select-id";

/**
 * @internal
 */
export const ALL_WORKSPACE_USERS = "allWorkspaceUsers";

/**
 * @internal
 */
export const GranteeRules: IGranteeRules = {
    type: ALL_WORKSPACE_USERS,
    id: {
        identifier: ALL_WORKSPACE_USERS,
    },
    permissions: ["VIEW"],
    inheritedPermissions: [],
};

/**
 * @internal
 */
export const GROUP_ALL_ID = "groupAll";

/**
 * @internal
 */
export const GranteeGroupAll: IGranteeGroupAll = {
    id: uriRef(GROUP_ALL_ID),
    type: "groupAll",
};

/**
 * @internal
 */
export const INACTIVE_OWNER_ID = "inactive_owner";

/**
 * @internal
 */
export const InactiveOwner: IGranteeInactiveOwner = {
    id: uriRef(INACTIVE_OWNER_ID),
    type: "inactive_owner",
};

/**
 * @internal
 */
const exhaustiveCheck = (_param: never): never => {
    throw new Error("unknown grantee type");
};

/**
 * @internal
 */
export const getGranteeLabel = (grantee: GranteeItem, intl: IntlShape): string => {
    if (grantee.type === "user" || grantee.type === "granularUser") {
        if (grantee.isCurrentUser) {
            return intl.formatMessage(
                { id: "shareDialog.share.grantee.item.you" },
                { userName: grantee.name },
            );
        }
        return grantee.name;
    } else if (grantee.type === "group" || grantee.type === "granularGroup") {
        return grantee.name;
    } else if (grantee.type === "groupAll" || grantee.type === "allWorkspaceUsers") {
        return intl.formatMessage({ id: "shareDialog.share.grantee.item.user.all" });
    } else if (grantee.type === "inactive_owner") {
        return intl.formatMessage({ id: "shareDialog.share.grantee.item.user.inactive" });
    } else {
        exhaustiveCheck(grantee);
    }
    return undefined;
};

/**
 * @internal
 */
export const sortGranteesByName =
    (intl: IntlShape) =>
    (granteeA: GranteeItem, granteeB: GranteeItem): number => {
        const textA = getGranteeLabel(granteeA, intl).toUpperCase();
        const textB = getGranteeLabel(granteeB, intl).toUpperCase();

        return textA < textB ? -1 : textA > textB ? 1 : 0;
    };

export const sortGranteeList = (grantees: GranteeItem[], intl: IntlShape): GranteeItem[] => {
    const granteeSort = sortGranteesByName(intl);

    const hasAllGroup = hasGroupAll(grantees);
    const granteeRules = grantees.find((g) => isGranteeRules(g));

    const granteesWithNoAllGroup: GranteeItem[] = grantees.filter(
        (g) => !(isGranteeGroupAll(g) || isGranteeRules(g)),
    );

    const [groups, users] = partition(
        granteesWithNoAllGroup,
        (grantee) => isGranteeGroup(grantee) || isGranularGranteeGroup(grantee),
    );

    const sorted = [...groups.sort(granteeSort), ...users.sort(granteeSort)];

    if (hasAllGroup) {
        return [GranteeGroupAll, ...sorted];
    }

    if (granteeRules) {
        return [granteeRules, ...sorted];
    }

    return sorted;
};

/**
 * @internal
 */
export const notInArrayFilter = (array: GranteeItem[], notInArray: GranteeItem[]): GranteeItem[] => {
    return differenceWith(array, notInArray, (g, g1) => areObjRefsEqual(g.id, g1.id));
};

/**
 * @internal
 */
export const hasGroupAll = (array: GranteeItem[]): boolean => {
    return array.some((g) => areObjRefsEqual(g.id, GranteeGroupAll.id));
};

/**
 * @internal
 */
export const hasGranteeRules = (array: GranteeItem[]): boolean => {
    return array.some((g) => isGranteeRules(g));
};

/**
 * @internal
 */
export const getAppliedGrantees = (
    grantees: GranteeItem[],
    granteesToAdd: GranteeItem[],
    granteesToDelete: GranteeItem[],
): GranteeItem[] => {
    const omitDeleted = notInArrayFilter(grantees, granteesToDelete);
    return [...omitDeleted, ...granteesToAdd];
};

/**
 * @internal
 */
export const getGranteeItemTestId = (grantee: GranteeItem, prefix?: "option"): string => {
    const prefixValue = prefix ? `${prefix}-` : "";
    const id = objRefToString(grantee.id).split("/").pop();
    return `s-gd-grantee-item-id-${prefixValue}${stringUtils.simplifyText(id)}`;
};

/**
 * @internal
 */
export const getGranularGranteeClassNameId = (grantee: GranteeItem): string => {
    const id = objRefToString(grantee.id).split("/").pop();
    return `gd-granular-grantee-item-id-${stringUtils.simplifyText(id)}`;
};

/**
 * @internal
 */
export const getGranularPermissionFromUserPermissions = (
    userPermissions: CurrentUserPermissions,
): AccessGranularPermission | undefined => {
    if (userPermissions.canEditAffectedObject || userPermissions.canEditLockedAffectedObject) {
        return "EDIT";
    } else if (userPermissions.canShareAffectedObject || userPermissions.canShareLockedAffectedObject) {
        return "SHARE";
    } else if (userPermissions.canViewAffectedObject) {
        return "VIEW";
    } else {
        return undefined;
    }
};

/**
 * Decide whether specific grantee is the currently logged in user.
 *
 * In some cases, current user might have uriRef instead of idRef or vice versa. This would result in
 * a false negative match. Method conveniently checks also user login to avoid such mismatch.
 *
 * @internal
 */
export const getIsGranteeCurrentUser = (granteeRef: ObjRef, currentUser: IUser) => {
    return (
        areObjRefsEqual(granteeRef, currentUser.ref) || areObjRefsEqual(granteeRef, idRef(currentUser.login))
    );
};
