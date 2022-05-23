// (C) 2022 GoodData Corporation
import { IAttributeDisplayFormMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { AttributeFilterStoreContext } from "../types";

/**
 * @internal
 */
export async function loadDisplayForm(
    context: AttributeFilterStoreContext,
    ref: ObjRef,
): Promise<IAttributeDisplayFormMetadataObject> {
    return context.backend.workspace(context.workspace).attributes().getAttributeDisplayForm(ref);
}
