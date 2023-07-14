// (C) 2007-2023 GoodData Corporation
import {
    ObjQualifier,
    Qualifier,
    isLocalIdentifierQualifier,
    isObjectUriQualifier,
} from "@gooddata/api-model-bear";
import { ObjectType, ObjRef, ObjRefInScope, idRef, uriRef, localIdRef } from "@gooddata/sdk-model";

/**
 * Converts reference into a format acceptable by the SPI. URI references are left as-is, while
 * the identifier references have the object type added.
 *
 * @param ref - reference
 * @param defaultType - type to use it the ref has none specified
 * @internal
 */
export function fromBearRef(ref: ObjQualifier, defaultType: ObjectType): ObjRef {
    if (isObjectUriQualifier(ref)) {
        return uriRef(ref.uri);
    }

    return idRef(ref.identifier, defaultType);
}

/**
 * Converts scoped reference into a format acceptable by the bear SPI. URI references are left as-is, scoped
 * references are left as is, while the identifier references have the object type added.
 *
 * @param ref - reference
 * @param defaultType - type to use it the ref has none specified
 * @internal
 */
export function fromScopedBearRef(ref: Qualifier, defaultType: ObjectType): ObjRefInScope {
    if (isLocalIdentifierQualifier(ref)) {
        return localIdRef(ref.localIdentifier);
    }

    return fromBearRef(ref, defaultType);
}
