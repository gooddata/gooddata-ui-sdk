// (C) 2022 GoodData Corporation
import { convertError } from "@gooddata/sdk-ui";
import { IAttributeMetadataObject, ObjRef } from "@gooddata/sdk-model";
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
