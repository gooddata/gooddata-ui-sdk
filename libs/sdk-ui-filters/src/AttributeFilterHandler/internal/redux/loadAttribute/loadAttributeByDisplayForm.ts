// (C) 2022-2026 GoodData Corporation

import {
    type IAttributeMetadataObject,
    type ObjRef,
    computedAttributeAsAttributeMetadataObject,
    isComputedAttributeRef,
} from "@gooddata/sdk-model";
import { convertError } from "@gooddata/sdk-ui";

import { type IAttributeFilterHandlerStoreContext } from "../store/types.js";

/**
 * @internal
 */
export async function loadAttributeByDisplayForm(
    context: IAttributeFilterHandlerStoreContext,
    displayFormRef: ObjRef,
): Promise<IAttributeMetadataObject> {
    const workspace = context.backend.workspace(context.workspace);

    // A display form ref typed as a computed attribute resolves through the computed attribute
    // service; the fabricated display form shares the computed attribute's own ref.
    if (isComputedAttributeRef(displayFormRef)) {
        return workspace
            .computedAttributes()
            .getComputedAttribute(displayFormRef)
            .then(computedAttributeAsAttributeMetadataObject)
            .catch((err) => {
                // Convert from AnalyticalBackendError to GoodDataSdkError
                throw convertError(err);
            });
    }

    return workspace
        .attributes()
        .getAttributeByDisplayForm(displayFormRef)
        .catch((err) => {
            // Convert from AnalyticalBackendError to GoodDataSdkError
            throw convertError(err);
        });
}
