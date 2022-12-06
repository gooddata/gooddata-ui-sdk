// (C) 2020-2022 GoodData Corporation

import { ShareStatus } from "@gooddata/sdk-model";

/**
 * TODO: TIGER-HACK: a nasty way to identify that an object is inherited from some parent workspace. This is
 *  determined by checking for colon character in the object identifier.
 *
 * @param id - object identifier
 */
export function isInheritedObject(id: string): boolean {
    return id.indexOf(":") > -1;
}

/**
 * Unlike on Bear that supports share status as "private", "public", or "shared", Tiger maps the shared boolean
 * attribute value only to "private" or "shared" values. Reason for that is that Tiger does not support sharing
 * of objects with everyone in the platform and therefore the object is never truly public.
 *
 * @param isObjectShared - boolean indicating whether dashboard is shared
 */
export function getShareStatus(isObjectShared: boolean): ShareStatus {
    return isObjectShared ? "shared" : "private";
}
