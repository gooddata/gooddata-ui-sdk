// (C) 2007-2026 GoodData Corporation

import { type ObjRef, type ObjRefInScope, isLocalIdRef, isUriRef } from "@gooddata/sdk-model";

/**
 * Converts reference into a format acceptable by the bear backend. URI references are left as-is, while
 * the identifier references have the object type (if any) stripped.
 */
export function toBearRef(ref: ObjRef): ObjRef {
    if (isUriRef(ref)) {
        return ref;
    }

    return { identifier: ref.identifier };
}

/**
 * Converts scoped reference into a format acceptable by the bear backend. URI references are left as-is, scoped
 * references are left as is, while the identifier references have the object type (if any) stripped.
 */
export function toScopedBearRef(ref: ObjRefInScope): ObjRefInScope {
    if (isLocalIdRef(ref)) {
        return ref;
    }

    return toBearRef(ref);
}
