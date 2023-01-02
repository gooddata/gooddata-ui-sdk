// (C) 2007-2023 GoodData Corporation

import { isLocalIdRef, isUriRef, ObjRef, ObjRefInScope, idRef, uriRef } from "@gooddata/sdk-model";

/**
 * Converts reference into a format acceptable by the bear backend. URI references are left as-is, while
 * the identifier references have the object type (if any) stripped.
 *
 * @param ref - reference
 * @internal
 */
export function toBearRef(ref: ObjRef): ObjRef {
    if (isUriRef(ref)) {
        return uriRef(ref.uri);
    }

    return idRef(ref.identifier);
}

/**
 * Converts scoped reference into a format acceptable by the bear backend. URI references are left as-is, scoped
 * references are left as is, while the identifier references have the object type (if any) stripped.
 *
 * @param ref - reference
 * @internal
 */
export function toScopedBearRef(ref: ObjRefInScope): ObjRefInScope {
    if (isLocalIdRef(ref)) {
        return ref;
    }

    return toBearRef(ref);
}
