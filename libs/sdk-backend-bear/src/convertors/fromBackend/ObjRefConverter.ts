// (C) 2007-2023 GoodData Corporation
import * as GdcExecuteAFM from "@gooddata/api-model-bear/GdcExecuteAFM";

import * as GdcVisualizationObject from "@gooddata/api-model-bear/GdcVisualizationObject";
import { ObjectType, ObjRef, ObjRefInScope, idRef, uriRef, localIdRef } from "@gooddata/sdk-model";

/**
 * Converts reference into a format acceptable by the SPI. URI references are left as-is, while
 * the identifier references have the object type added.
 *
 * @param ref - reference
 * @param defaultType - type to use it the ref has none specified
 * @internal
 */
export function fromBearRef(ref: GdcVisualizationObject.ObjQualifier, defaultType: ObjectType): ObjRef {
    if (GdcExecuteAFM.isObjectUriQualifier(ref)) {
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
export function fromScopedBearRef(ref: GdcExecuteAFM.Qualifier, defaultType: ObjectType): ObjRefInScope {
    if (GdcExecuteAFM.isLocalIdentifierQualifier(ref)) {
        return localIdRef(ref.localIdentifier);
    }

    return fromBearRef(ref, defaultType);
}
