// (C) 2022-2025 GoodData Corporation
import { type IAttributeMetadataObject, type ObjRef } from "@gooddata/sdk-model";
import { convertError } from "@gooddata/sdk-ui";

import { type AttributeFilterHandlerStoreContext } from "../store/types.js";

/**
 * @internal
 */
export async function loadAttributeByDisplayForm(
    context: AttributeFilterHandlerStoreContext,
    displayFormRef: ObjRef,
): Promise<IAttributeMetadataObject> {
    return context.backend
        .workspace(context.workspace)
        .attributes()
        .getAttributeByDisplayForm(displayFormRef)
        .catch((err) => {
            // Convert from AnalyticalBackendError to GoodDataSdkError
            throw convertError(err);
        });
}
