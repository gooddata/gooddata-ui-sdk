// (C) 2022 GoodData Corporation
import { IAttributeMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { AttributeFilterStoreContext } from "../types";

/**
 * @internal
 */
export async function loadAttribute(
    context: AttributeFilterStoreContext,
    ref: ObjRef,
): Promise<IAttributeMetadataObject> {
    return context.backend.workspace(context.workspace).attributes().getAttribute(ref);
}
