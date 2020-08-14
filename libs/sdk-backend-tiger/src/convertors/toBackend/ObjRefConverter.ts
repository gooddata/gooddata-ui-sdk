// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import { isUriRef, ObjRef, ObjectType, isLocalIdRef, ObjRefInScope, isObjRef } from "@gooddata/sdk-model";
import { ExecuteAFM } from "@gooddata/api-client-tiger";
import ObjQualifier = ExecuteAFM.ObjQualifier;
import ILocalIdentifierQualifier = ExecuteAFM.ILocalIdentifierQualifier;
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

    const type = tigerAfmTypeByObjectAfmType[value];
    return type;
}

export function toObjQualifier(ref: ObjRef, defaultValue?: TigerAfmType): ObjQualifier {
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
export function toFactQualifier(ref: ObjRef): ObjQualifier {
    return toObjQualifier(ref, "fact");
}

/**
 * @internal
 */
export function toDisplayFormQualifier(ref: ObjRef): ObjQualifier {
    return toObjQualifier(ref, "label");
}

/**
 * @internal
 */
export function toDateDataSetQualifier(ref: ObjRef): ObjQualifier {
    return toObjQualifier(ref, "dataset");
}

/**
 * @internal
 */
export function toLocalIdentifier(localIdentifier: string): ILocalIdentifierQualifier {
    return {
        localIdentifier,
    };
}

/**
 * @internal
 */
export function toMeasureValueFilterMeasureQualifier(
    ref: ObjRefInScope,
): ExecuteAFM.ILocalIdentifierQualifier | ExecuteAFM.IObjIdentifierQualifier {
    if (isLocalIdRef(ref)) {
        return toLocalIdentifier(ref.localIdentifier);
    } else if (isObjRef(ref)) {
        return toObjQualifier(ref);
    } else {
        throw new UnexpectedError(
            `The measure property of measure value filter must be either object reference or local identifier`,
        );
    }
}
