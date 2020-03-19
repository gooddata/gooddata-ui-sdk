// (C) 2007-2020 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import { isUriRef, ObjRef, ObjectType } from "@gooddata/sdk-model";
import { ExecuteAFM } from "@gooddata/gd-tiger-client";
import ObjQualifier = ExecuteAFM.ObjQualifier;
import ILocalIdentifierQualifier = ExecuteAFM.ILocalIdentifierQualifier;
import { TigerExecutionType } from "../types";

type ExecutionObjectType = Exclude<ObjectType, "tag">;

const allValidExecutionTypes: ExecutionObjectType[] = [
    "measure",
    "displayForm",
    "fact",
    "dataSet",
    "attribute",
];

const tigerExecutionTypeByObjectType: {
    [objectType in ExecutionObjectType]: TigerExecutionType;
} = {
    attribute: "attribute",
    measure: "metric",
    displayForm: "label",
    dataSet: "dataSet",
    fact: "fact",
};

const isValidExecutionType = (obj: any): obj is ExecutionObjectType => {
    return !isEmpty(obj) && allValidExecutionTypes.some(afmType => afmType === obj);
};

// TODO: get rid of the defaultValue, tiger should explode if ref is not provided correctly
function toTigerExecutionType(
    value: ObjectType | undefined,
    defaultValue: TigerExecutionType,
): TigerExecutionType {
    if (!value) {
        return defaultValue;
    }

    if (!isValidExecutionType(value)) {
        throw new UnexpectedError(`Cannot convert ${value} to AFM type, ${value} is not valid AfmObjectType`);
    }

    const type = tigerExecutionTypeByObjectType[value];
    return type;
}

function toObjQualifier(ref: ObjRef, defaultValue: TigerExecutionType): ObjQualifier {
    if (isUriRef(ref)) {
        throw new NotSupported(`Tiger backend does not allow referencing objects by URI.`);
    }

    return {
        identifier: {
            id: ref.identifier,
            type: toTigerExecutionType(ref.type, defaultValue),
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
    return toObjQualifier(ref, "dataSet");
}

/**
 * @internal
 */
export function toLocalIdentifier(localIdentifier: string): ILocalIdentifierQualifier {
    return {
        localIdentifier,
    };
}
