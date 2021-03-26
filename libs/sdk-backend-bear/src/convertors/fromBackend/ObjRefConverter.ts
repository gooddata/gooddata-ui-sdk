// (C) 2007-2021 GoodData Corporation

import { isLocalIdRef, isUriRef, ObjectType, ObjRef, ObjRefInScope } from "@gooddata/sdk-model";

/**
 * Converts reference into a format acceptable by the SPI. URI references are left as-is, while
 * the identifier references have the object type added.
 *
 * @param ref - reference
 * @param defaultType - type to use it the ref has none specified
 * @internal
 */
export function fromBearRef(ref: ObjRef, defaultType?: ObjectType): ObjRef {
    if (isUriRef(ref)) {
        return ref;
    }

    return { identifier: ref.identifier, type: ref.type ?? defaultType };
}

/**
 * Converts scoped reference into a format acceptable by the bear SPI. URI references are left as-is, scoped
 * references are left as is, while the identifier references have the object type added.
 *
 * @param ref - reference
 * @param defaultType - type to use it the ref has none specified
 * @internal
 */
export function fromScopedBearRef(ref: ObjRefInScope, defaultType?: ObjectType): ObjRefInScope {
    if (isLocalIdRef(ref)) {
        return ref;
    }

    return fromBearRef(ref, defaultType);
}
