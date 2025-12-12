// (C) 2007-2025 GoodData Corporation
import { isEmpty } from "lodash-es";

import { type AfmLocalIdentifier, type AfmObjectIdentifier } from "@gooddata/api-client-tiger";
import { NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import { type LocalIdRef, type ObjRef, idRef, isUriRef, localIdRef } from "@gooddata/sdk-model";

import { type TigerObjectType } from "../../types/index.js";
import {
    type TigerCompatibleObjectType,
    isTigerType,
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
