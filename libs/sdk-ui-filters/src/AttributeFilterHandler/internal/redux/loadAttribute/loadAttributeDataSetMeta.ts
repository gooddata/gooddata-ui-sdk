// (C) 2023 GoodData Corporation
import { convertError } from "@gooddata/sdk-ui";
import { IMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { AttributeFilterHandlerStoreContext } from "../store/types";

/**
 * @internal
 */
export async function loadAttributeDataSetMeta(
    context: AttributeFilterHandlerStoreContext,
    displayFormRef: ObjRef,
): Promise<IMetadataObject> {
    return context.backend
        .workspace(context.workspace)
        .attributes()
        .getAttributeDatasetMeta(displayFormRef)
        .catch((err) => {
            // Convert from AnalyticalBackendError to GoodDataSdkError
            throw convertError(err);
        });
}
