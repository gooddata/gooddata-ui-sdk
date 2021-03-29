// (C) 2007-2021 GoodData Corporation
import { Identifier, ObjectIdentifier } from "@gooddata/api-client-tiger";
import { NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import { idRef, isLocalIdRef, isUriRef, localIdRef, ObjRef, ObjRefInScope } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

import { TigerObjectType } from "../../types";
import { isTigerType, TigerCompatibleObjectType, tigerIdTypeToObjectType } from "../../types/refTypeMapping";

export function toObjectType(value: TigerObjectType): TigerCompatibleObjectType {
    if (!isTigerType(value)) {
        throw new UnexpectedError(`Cannot convert ${value} to ObjRef, ${value} is not valid TigerAfmType`);
    }

    return tigerIdTypeToObjectType[value];
}

export function toObjRef(qualifier: ObjectIdentifier): ObjRef {
    if (isUriRef(qualifier)) {
        throw new NotSupported(`Tiger backend does not allow referencing objects by URI.`);
    }

    return idRef(qualifier.identifier.id, toObjectType(qualifier.identifier.type as TigerObjectType));
}

export function toObjRefInScope(qualifier: Identifier): ObjRefInScope {
    if (isLocalIdRef(qualifier)) {
        return localIdRef(qualifier.localIdentifier);
    }

    return toObjRef(qualifier);
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
