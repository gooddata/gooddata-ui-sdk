// (C) 2022 GoodData Corporation
import { ObjRefInScope, serializeObjRef } from "@gooddata/sdk-model";

/**
 * Wrapper around {@link @gooddata/sdk-model#serializeObjRef} that can handle undefined values.
 *
 * @param ref - ref to serialize
 */
export function safeSerializeObjRef(ref: ObjRefInScope | undefined): string {
    return ref ? serializeObjRef(ref) : "";
}
