// (C) 2026 GoodData Corporation

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";

/**
 * Whether an access-list error means object-level permissions aren't available to
 * the caller. The permissions endpoint is manage-gated and denies a caller who can't
 * manage the object (or label) with **403**; it answers **404** when the object is not
 * visible to the caller at all. Both are definitive: the caller has nothing to act on.
 * We match those two statuses and nothing else — a transient failure (5xx / network)
 * may still resolve, so it must not be read as a permanent "no". If the backend ever
 * signals this differently, widen here deliberately, in coordination with the backend.
 *
 * @internal
 */
export function isPermissionsNotAvailable(error: unknown): boolean {
    return isUnexpectedResponseError(error) && (error.httpStatus === 403 || error.httpStatus === 404);
}
