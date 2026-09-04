// (C) 2022-2026 GoodData Corporation

import {
    type IAttributeMetadataObject,
    type IComputedAttributeMetadataObject,
    type ObjRef,
    isComputedAttributeRef,
} from "@gooddata/sdk-model";
import { convertError } from "@gooddata/sdk-ui";

import { type IAttributeFilterHandlerStoreContext } from "../store/types.js";

/**
 * Adapts a computed attribute to the attribute-like surface this handler works with.
 *
 * Only the `type` discriminator is rewritten - the ref, the fabricated display form and the rest of
 * the metadata are kept verbatim. The result therefore CLAIMS to be a plain attribute while its
 * `ref.type` still says `computedAttribute`; `ref` is the honest signal, not `type`. The rewrite
 * lives here, in the one consumer that wants the fiction, so the backend's
 * `getAttributeByDisplayForm` contract stays truthful for everyone else.
 */
function asAttributeMetadataObject(
    computedAttribute: IComputedAttributeMetadataObject,
): IAttributeMetadataObject {
    return {
        ...computedAttribute,
        type: "attribute",
    };
}

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
            .then(asAttributeMetadataObject)
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
