// (C) 2007-2024 GoodData Corporation
import { AfmLocalIdentifier, AfmObjectIdentifier } from "@gooddata/api-client-tiger";
import { NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import { isUriRef, idRef, ObjRef, localIdRef, LocalIdRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";

import { TigerObjectType } from "../../types/index.js";
import {
    isTigerType,
    TigerCompatibleObjectType,
    tigerIdTypeToObjectType,
} from "../../types/refTypeMapping.js";

export function toObjectType(value: TigerObjectType): TigerCompatibleObjectType {
    if (!isTigerType(value)) {
        throw new UnexpectedError(`Cannot convert ${value} to ObjRef, ${value} is not valid TigerAfmType`);
    }

    return tigerIdTypeToObjectType[value];
}

export function toObjRef(qualifier: AfmObjectIdentifier): ObjRef {
    if (isUriRef(qualifier)) {
        throw new NotSupported(`Tiger backend does not allow referencing objects by URI.`);
    }

    return idRef(qualifier.identifier.id, toObjectType(qualifier.identifier.type as TigerObjectType));
}

export function toLocalRef(qualifier: AfmLocalIdentifier): LocalIdRef {
    return localIdRef(qualifier.localIdentifier);
}

export type JsonApiId = {
    id: string;
    type: string;
};

export function isJsonApiId(obj: unknown): obj is JsonApiId {
    return !isEmpty(obj) && (obj as any)?.id !== undefined && (obj as any)?.type !== undefined;
}

export function jsonApiIdToObjRef(idAndType: JsonApiId): ObjRef {
    return idRef(idAndType.id, toObjectType(idAndType.type as TigerObjectType));
}
