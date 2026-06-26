// (C) 2026 GoodData Corporation

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";

/**
 * Whether an access-list error means object-level permissions aren't available to
 * the caller: the manage-gated permissions endpoint returns **404** for an object
 * (or label) the caller can't manage. We match that exact status and nothing else
 * — a transient failure (5xx / 403 / network) may still resolve, so it must not be
 * read as a permanent "no". If the backend ever signals this with a different
 * status, widen here deliberately, in coordination with the backend.
 *
 * @internal
 */
export function isPermissionsNotAvailable(error: unknown): boolean {
    return isUnexpectedResponseError(error) && error.httpStatus === 404;
}
