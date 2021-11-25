// (C) 2021 GoodData Corporation
import { IntlShape } from "react-intl";
import { areObjRefsEqual, objRefToString, uriRef } from "@gooddata/sdk-model";
import { GranteeItem, IGranteeGroupAll, IGranteeInactiveOwner } from "./types";
import differenceWith from "lodash/differenceWith";

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
    if (grantee.type === "user") {
        return grantee.name;
    } else if (grantee.type === "group") {
        return grantee.name;
    } else if (grantee.type === "groupAll") {
        return intl.formatMessage({ id: "shareDialog.share.grantee.item.user.all" });
    } else if (grantee.type === "inactive_owner") {
        return intl.formatMessage({ id: "shareDialog.share.grantee.item.user.inactive" });
    } else {
        exhaustiveCheck(grantee);
    }
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
    return `s-gd-grantee-item-id-${prefixValue}${id}`;
};
