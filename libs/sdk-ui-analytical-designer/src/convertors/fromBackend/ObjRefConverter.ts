// (C) 2007-2026 GoodData Corporation

import {
    type ObjRef,
    type ObjRefInScope,
    type ObjectType,
    idRef,
    localIdRef,
    uriRef,
} from "@gooddata/sdk-model";

import {
    type ObjQualifier,
    type Qualifier,
    isObjectUriQualifier,
    isLocalIdentifierQualifier as isVisualizationObjectLocalIdentifierQualifier,
} from "../../typings/bear/bearTypes.js";

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
    if (isVisualizationObjectLocalIdentifierQualifier(ref)) {
        return localIdRef(ref.localIdentifier);
    }

    return fromBearRef(ref, defaultType);
}
