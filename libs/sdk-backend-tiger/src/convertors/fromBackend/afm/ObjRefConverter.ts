// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import { isUriRef, ObjRef, ObjectType } from "@gooddata/sdk-model";
import { ExecuteAFM } from "@gooddata/api-client-tiger";
import ObjQualifier = ExecuteAFM.ObjQualifier;
import { TigerAfmType } from "../../../types";

const allValidTigerAfmTypes: TigerAfmType[] = ["metric", "label", "fact", "dataset", "attribute"];

const objRefTypeByTigerType: {
    [objectType in TigerAfmType]: ObjectType;
} = {
    attribute: "attribute",
    metric: "measure",
    label: "displayForm",
    dataset: "dataSet",
    fact: "fact",
    variable: "variable",
};

const isValidTigerAfmType = (obj: any): obj is TigerAfmType => {
    return !isEmpty(obj) && allValidTigerAfmTypes.some((afmType) => afmType === obj);
};

function toObjectType(value: TigerAfmType): ObjectType {
    if (!isValidTigerAfmType(value)) {
        throw new UnexpectedError(`Cannot convert ${value} to ObjRef, ${value} is not valid TigerAfmType`);
    }

    const type = objRefTypeByTigerType[value];
    return type;
}

export function toObjRef(qualifier: ObjQualifier): ObjRef {
    if (isUriRef(qualifier)) {
        throw new NotSupported(`Tiger backend does not allow referencing objects by URI.`);
    }

    return {
        identifier: qualifier.identifier.id,
        type: toObjectType(qualifier.identifier.type as TigerAfmType),
    };
}

export type JsonApiId = {
    id: string;
    type: string;
};

export function isJsonApiId(obj: any): obj is JsonApiId {
    return !isEmpty(obj) && obj?.id !== undefined && obj?.type !== undefined;
}

export function jsonApiIdToObjRef(idAndType: JsonApiId): ObjRef {
    return {
        identifier: idAndType.id,
        type: toObjectType(idAndType.type as TigerAfmType),
    };
}
