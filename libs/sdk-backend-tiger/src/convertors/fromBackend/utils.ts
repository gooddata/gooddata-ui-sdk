// (C) 2023 GoodData Corporation

import { type ShareStatus } from "@gooddata/sdk-model";

/**
 * Unlike on Bear that supports share status as "private", "public", or "shared", Tiger maps the shared boolean
 * attribute value only to "private" or "shared" values. Reason for that is that Tiger does not support sharing
 * of objects with everyone in the platform and therefore the object is never truly public.
 *
 * @param isObjectPrivate - boolean indicating whether dashboard is private
 */
export function getShareStatus(isObjectPrivate: boolean): ShareStatus {
    return isObjectPrivate ? "private" : "shared";
}

/**
 * Remove the question mark and following characters from a string
 *
 * @param uri - a URI with or without query params
 */
export function stripQueryParams(uri: string) {
    return uri.split("?")[0];
}
