// (C) 2020-2023 GoodData Corporation

import {
    JsonApiAnalyticalDashboardOutMeta,
    JsonApiAnalyticalDashboardOutMetaOrigin,
} from "@gooddata/api-client-tiger";
import last from "lodash/last.js";
import first from "lodash/first.js";

type JsonApiMetadataLikeObject<T> = T & {
    id: string;
    type: string;
    meta?: JsonApiAnalyticalDashboardOutMeta;
};
const PrefixSeparator = ":";

export function isInheritedObject<T = unknown>(obj: JsonApiMetadataLikeObject<T>): boolean {
    const { originType } = getObjectOrigin(obj);
    return originType === "PARENT";
}

export function getObjectOrigin<T = unknown>(
    obj: JsonApiMetadataLikeObject<T>,
): JsonApiAnalyticalDashboardOutMetaOrigin {
    const { origin } = obj.meta || {};
    return origin || { originType: "NATIVE", originId: "" };
}

/**
 * @internal
 */
export type OriginInfoWithId = JsonApiAnalyticalDashboardOutMetaOrigin & { id: string };

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
export function getIdOrigin(id: string): OriginInfoWithId {
    const data = id.split(PrefixSeparator);

    //prefix + id
    if (data.length === 2) {
        return {
            originType: "PARENT",
            originId: first(data)!,
            id: last(data)!,
        };
    }
    return {
        originType: "NATIVE",
        originId: "",
        id,
    };
}
