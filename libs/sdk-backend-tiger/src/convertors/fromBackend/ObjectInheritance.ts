// (C) 2020-2026 GoodData Corporation

import {
    type JsonApiDatasetOutMeta,
    type JsonApiDatasetOutMetaOrigin,
    type JsonApiDatasetOutMetaOriginOriginTypeEnum,
} from "@gooddata/api-client-tiger";

type JsonApiMetadataLikeObject<T> = T & {
    id: string;
    type: string;
    meta?: JsonApiDatasetOutMeta;
};
const PrefixSeparator = ":";

export function isInheritedObject<T = unknown>(obj: JsonApiMetadataLikeObject<T>): boolean {
    const { originType } = getObjectOrigin(obj);
    return originType === "PARENT";
}

export function getObjectOrigin<T = unknown>(obj: JsonApiMetadataLikeObject<T>): JsonApiDatasetOutMetaOrigin {
    const { origin } = obj.meta || {};
    return origin || { originType: "NATIVE", originId: "" };
}

/**
 * @internal
 */
export interface IOriginInfoWithId {
    originType: JsonApiDatasetOutMetaOriginOriginTypeEnum;
    originId: string;
    id: string;
}

/**
 * This method split id by Prefix separator (:) and return origin info
 *
 * @remarks
 * Id without prefix - LOCAL origin type with not origin id
 * Id with prefix - REMOTE origin type with origin id as first part of id (before :) and
 *  id as second part if id (after :)
 *
 * @param id - string that represent id with or without prefix
 * @internal
 */
export function getIdOrigin(id: string): IOriginInfoWithId {
    const data = id.split(PrefixSeparator);

    //prefix + id
    if (data.length === 2) {
        return {
            originType: "PARENT",
            originId: data.at(0)!,
            id: data.at(-1)!,
        };
    }
    return {
        originType: "NATIVE",
        originId: "",
        id,
    };
}
