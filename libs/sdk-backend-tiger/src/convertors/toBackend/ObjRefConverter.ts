// (C) 2007-2020 GoodData Corporation
import { LocalIdentifier, ObjectIdentifier } from "@gooddata/api-client-tiger";
import { NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    isIdentifierRef,
    isLocalIdRef,
    isUriRef,
    ObjectType,
    ObjRef,
    ObjRefInScope,
} from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";
import { TigerAfmType } from "../../types";

type AfmObjectType = Exclude<ObjectType, "tag" | "insight" | "analyticalDashboard">;

const allValidAfmTypes: AfmObjectType[] = ["measure", "displayForm", "fact", "dataSet", "attribute"];

const tigerAfmTypeByObjectAfmType: {
    [objectType in AfmObjectType]: TigerAfmType;
} = {
    attribute: "attribute",
    measure: "metric",
    displayForm: "label",
    dataSet: "dataset",
    fact: "fact",
    variable: "variable",
};

const isValidAfmType = (obj: any): obj is AfmObjectType => {
    return !isEmpty(obj) && allValidAfmTypes.some((afmType) => afmType === obj);
};

// TODO: get rid of the defaultValue, tiger should explode if ref is not provided correctly
function toTigerAfmType(value: ObjectType | undefined, defaultValue?: TigerAfmType): TigerAfmType {
    if (!value) {
        if (!defaultValue) {
            throw new UnexpectedError("No value or default value was provided to toTigerAfmType ");
        }

        return defaultValue;
    }

    if (!isValidAfmType(value)) {
        throw new UnexpectedError(`Cannot convert ${value} to AFM type, ${value} is not valid AfmObjectType`);
    }

    return tigerAfmTypeByObjectAfmType[value];
}

export function toObjQualifier(ref: ObjRef, defaultValue?: TigerAfmType): ObjectIdentifier {
    if (isUriRef(ref)) {
        throw new NotSupported(`Tiger backend does not allow referencing objects by URI.`);
    }

    return {
        identifier: {
            id: ref.identifier,
            type: toTigerAfmType(ref.type, defaultValue),
        },
    };
}

/**
 * @internal
 */
export function toFactQualifier(ref: ObjRef): ObjectIdentifier {
    return toObjQualifier(ref, "fact");
}

/**
 * @internal
 */
export function toDisplayFormQualifier(ref: ObjRef): ObjectIdentifier {
    return toObjQualifier(ref, "label");
}

/**
 * @internal
 */
export function toDateDataSetQualifier(ref: ObjRef): ObjectIdentifier {
    return toObjQualifier(ref, "dataset");
}

/**
 * @internal
 */
export function toLocalIdentifier(localIdentifier: string): LocalIdentifier {
    return {
        localIdentifier,
    };
}

/**
 * @internal
 */
export function toMeasureValueFilterMeasureQualifier(ref: ObjRefInScope): LocalIdentifier | ObjectIdentifier {
    if (isLocalIdRef(ref)) {
        return toLocalIdentifier(ref.localIdentifier);
    } else if (isIdentifierRef(ref)) {
        if (!ref.type) {
            throw new UnexpectedError(
                "Please explicitly specify idRef for measure value filter. You must provide both identifier and type of object you want to reference.",
            );
        }
        return toObjQualifier(ref);
    } else {
        throw new UnexpectedError(
            `The measure property of measure value filter must be either object reference or local identifier`,
        );
    }
}
