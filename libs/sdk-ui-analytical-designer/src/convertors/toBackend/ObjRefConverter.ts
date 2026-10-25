// (C) 2007-2026 GoodData Corporation

import { type ObjRef, type ObjRefInScope, idRef, isLocalIdRef, isUriRef, uriRef } from "@gooddata/sdk-model";

/**
 * Converts reference into the qualifier format of the legacy (bear era) structures. URI references are
 * left as-is; identifier references keep their object type.
 *
 * @remarks
 * The bear backend required the type to be stripped. These structures are today only emitted through
 * the post message API (drill events), whose identifier qualifier carries an optional type: consumers
 * can tell a label (`displayForm`) from a computed attribute (`computedAttribute`), a metric from a
 * date dataset, without any lookup. A computed attribute has no labels and is referenced directly, so
 * for it the type is the only distinguishing information.
 *
 * @param ref - reference
 * @internal
 */
export function toBearRef(ref: ObjRef): ObjRef {
    if (isUriRef(ref)) {
        return uriRef(ref.uri);
    }

    return idRef(ref.identifier, ref.type);
}

/**
 * Converts scoped reference into the qualifier format of the legacy structures. URI references are left
 * as-is, scoped references are left as is, identifier references keep their object type.
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
