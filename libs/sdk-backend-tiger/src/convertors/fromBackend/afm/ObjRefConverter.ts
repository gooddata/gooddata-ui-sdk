// (C) 2007-2020 GoodData Corporation
import { ObjectIdentifier } from "@gooddata/api-client-tiger";
import { NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import { isUriRef, ObjectType, ObjRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

import { TigerObjectType } from "../../../types";

const allValidTigerAfmTypes: TigerObjectType[] = [
    "metric",
    "label",
    "fact",
    "dataset",
    "attribute",
    "visualizationObject",
];

const objRefTypeByTigerType: {
    [objectType in TigerObjectType]: ObjectType;
} = {
    attribute: "attribute",
    metric: "measure",
    label: "displayForm",
    dataset: "dataSet",
    fact: "fact",
    variable: "variable",
    visualizationObject: "visualizationObject",
    analyticalDashboard: "analyticalDashboard",
};

const isValidTigerAfmType = (obj: any): obj is TigerObjectType => {
    return !isEmpty(obj) && allValidTigerAfmTypes.some((afmType) => afmType === obj);
};

function toObjectType(value: TigerObjectType): ObjectType {
    if (!isValidTigerAfmType(value)) {
        throw new UnexpectedError(`Cannot convert ${value} to ObjRef, ${value} is not valid TigerAfmType`);
    }

    return objRefTypeByTigerType[value];
}

export function toObjRef(qualifier: ObjectIdentifier): ObjRef {
    if (isUriRef(qualifier)) {
        throw new NotSupported(`Tiger backend does not allow referencing objects by URI.`);
    }

    return {
        identifier: qualifier.identifier.id,
        type: toObjectType(qualifier.identifier.type as TigerObjectType),
    };
}

export type JsonApiId = {
    id: string;
    type: string;
};

export function isJsonApiId(obj: unknown): obj is JsonApiId {
    return !isEmpty(obj) && (obj as any)?.id !== undefined && (obj as any)?.type !== undefined;
}

export function jsonApiIdToObjRef(idAndType: JsonApiId): ObjRef {
    return {
        identifier: idAndType.id,
        type: toObjectType(idAndType.type as TigerObjectType),
    };
}
