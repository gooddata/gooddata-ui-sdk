// (C) 2007-2026 GoodData Corporation

import {
    type AfmIdentifier,
    type AfmLocalIdentifier,
    type AfmObjectIdentifier,
    type AfmObjectIdentifierAttribute,
    type AfmObjectIdentifierCore,
    type AfmObjectIdentifierDataset,
    type AfmObjectIdentifierLabel,
} from "@gooddata/api-client-tiger";
import { NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    type ObjRef,
    type ObjRefInScope,
    isIdentifierRef,
    isLocalIdRef,
    isUriRef,
} from "@gooddata/sdk-model";

import { type TigerAfmType, type TigerObjectType } from "../../types/index.js";
import {
    type TigerCompatibleObjectType,
    isTigerAfmCompatibleType,
    isTigerCompatibleType,
    objectTypeToTigerAfmType,
    objectTypeToTigerIdType,
} from "../../types/refTypeMapping.js";

type TigerObjectIdentifier = {
    identifier: {
        id: string;
        type: TigerObjectType;
    };
};

// TODO: get rid of the defaultValue, tiger should explode if ref is not provided correctly
export function toTigerType(
    value: TigerCompatibleObjectType | undefined,
    defaultValue?: TigerObjectType,
): TigerObjectType {
    if (!value) {
        if (!defaultValue) {
            throw new UnexpectedError("No value or default value was provided to toTigerType ");
        }
        return defaultValue;
    }

    if (!isTigerCompatibleType(value)) {
        throw new UnexpectedError(`Cannot convert ${value} to Tiger object type, ${value} is not valid.`);
    }

    return objectTypeToTigerIdType[value];
}

function toTigerAfmType(
    value: TigerCompatibleObjectType | undefined,
    defaultValue?: TigerAfmType,
): TigerAfmType {
    if (!value) {
        if (!defaultValue) {
            throw new UnexpectedError("No value or default value was provided to toTigerAfmType ");
        }
        return defaultValue;
    }

    if (!isTigerAfmCompatibleType(value)) {
        throw new UnexpectedError(`Cannot convert ${value} to AFM type, ${value} is not valid AfmObjectType`);
    }

    return objectTypeToTigerAfmType[value];
}

export function toObjQualifier(ref: ObjRef, defaultValue?: TigerObjectType): TigerObjectIdentifier {
    if (isUriRef(ref)) {
        throw new NotSupported(`Tiger backend does not allow referencing objects by URI.`);
    }

    return {
        identifier: {
            id: ref.identifier,
            type: toTigerType(ref.type as TigerCompatibleObjectType | undefined, defaultValue),
        },
    };
}

function toAfmObjQualifier(ref: ObjRef, defaultValue?: TigerAfmType): AfmObjectIdentifier {
    if (isUriRef(ref)) {
        throw new NotSupported(`Tiger backend does not allow referencing objects by URI.`);
    }

    return {
        identifier: {
            id: ref.identifier,
            type: toTigerAfmType(ref.type as TigerCompatibleObjectType | undefined, defaultValue),
        },
    };
}

/**
 * @internal
 */
export function toFactQualifier(ref: ObjRef): AfmObjectIdentifierCore {
    return toAfmObjQualifier(ref, "fact") as AfmObjectIdentifierCore;
}

/**
 * @internal
 */
export function toLabelQualifier(ref: ObjRef): AfmObjectIdentifierLabel {
    return toAfmObjQualifier(ref, "label") as AfmObjectIdentifierLabel;
}

/**
 * @internal
 */
export function toAttributeQualifier(ref: ObjRef): AfmObjectIdentifierAttribute {
    return toAfmObjQualifier(ref, "attribute") as AfmObjectIdentifierAttribute;
}

/**
 * @internal
 */
export function toDateDataSetQualifier(ref: ObjRef): AfmObjectIdentifierDataset {
    return toAfmObjQualifier(ref, "dataset") as AfmObjectIdentifierDataset;
}

/**
 * @internal
 */
export function toLocalIdentifier(localIdentifier: string): AfmLocalIdentifier {
    return {
        localIdentifier,
    };
}

/**
 * @internal
 */
export function toAfmIdentifier(ref: ObjRefInScope): AfmIdentifier {
    if (isLocalIdRef(ref)) {
        return toLocalIdentifier(ref.localIdentifier);
    } else if (isIdentifierRef(ref)) {
        if (!ref.type) {
            throw new UnexpectedError(
                `Incomplete object specification in ${JSON.stringify(
                    ref,
                )}. You must provide both id and type of object you want to reference.`,
            );
        }
        return toAfmObjQualifier(ref);
    } else {
        throw new UnexpectedError(
            `Invalid object specification in ${JSON.stringify(
                ref,
            )}. Must be either object identifier or local identifier.`,
        );
    }
}
