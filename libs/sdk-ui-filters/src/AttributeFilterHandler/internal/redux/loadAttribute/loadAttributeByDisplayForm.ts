// (C) 2022-2025 GoodData Corporation
import { IAttributeMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { convertError } from "@gooddata/sdk-ui";

import { AttributeFilterHandlerStoreContext } from "../store/types.js";

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
