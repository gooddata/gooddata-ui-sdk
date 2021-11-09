// (C) 2021 GoodData Corporation
import { IntlShape } from "react-intl";
import { areObjRefsEqual, objRefToString, uriRef } from "@gooddata/sdk-model";
import { GranteeItem, IGranteeGroupAll, IGranteeUserInactive } from "./types";
import differenceWith from "lodash/differenceWith";

export const GROUP_ALL_ID = "groupAll";

export const GranteeGroupAll: IGranteeGroupAll = {
    id: uriRef(GROUP_ALL_ID),
    type: "groupAll",
};

export const INACTIVE_OWNER_ID = "inactive_owner";

export const InactiveOwner: IGranteeUserInactive = {
    id: uriRef(INACTIVE_OWNER_ID),
    type: "inactive_user",
};

const exhaustiveCheck = (_param: never): never => {
    throw new Error("unknown grantee type");
};

export const getGranteeLabel = (grantee: GranteeItem, intl: IntlShape): string => {
    if (grantee.type === "user") {
        return grantee.name;
    } else if (grantee.type === "group") {
        return grantee.name;
    } else if (grantee.type === "groupAll") {
        return intl.formatMessage({ id: "shareDialog.share.grantee.item.user.all" });
    } else if (grantee.type === "inactive_user") {
        return intl.formatMessage({ id: "shareDialog.share.grantee.item.user.inactive" });
    } else {
        exhaustiveCheck(grantee);
    }
};

export const sortGranteesByName =
    (intl: IntlShape) =>
    (granteeA: GranteeItem, granteeB: GranteeItem): number => {
        const textA = getGranteeLabel(granteeA, intl).toUpperCase();
        const textB = getGranteeLabel(granteeB, intl).toUpperCase();

        return textA < textB ? -1 : textA > textB ? 1 : 0;
    };

export const notInArrayFilter = (array: GranteeItem[], notInArray: GranteeItem[]): GranteeItem[] => {
    return differenceWith(array, notInArray, (g, g1) => areObjRefsEqual(g.id, g1.id));
};

/**
 * @internal
 */
export const getGranteeItemTestId = (grantee: GranteeItem, prefix?: "option"): string => {
    const prefixValue = prefix ? `${prefix}-` : "";
    const id = objRefToString(grantee.id).split("/").pop();
    return `s-gd-grantee-item-id-${prefixValue}${id}`;
};
