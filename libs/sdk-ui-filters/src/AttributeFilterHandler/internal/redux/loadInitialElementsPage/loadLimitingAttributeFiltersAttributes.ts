// (C) 2022-2025 GoodData Corporation
import { type IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import { type IAttributeMetadataObject, filterObjRef } from "@gooddata/sdk-model";
import { convertError } from "@gooddata/sdk-ui";

import { type AttributeFilterHandlerStoreContext } from "../store/types.js";

/**
 * @internal
 */
export async function loadLimitingAttributeFiltersAttributes(
    context: AttributeFilterHandlerStoreContext,
    limitingAttributeFilters: IElementsQueryAttributeFilter[],
): Promise<IAttributeMetadataObject[]> {
    const displayFormRefs = limitingAttributeFilters.map((limitingAttributeFilter) =>
        filterObjRef(limitingAttributeFilter.attributeFilter),
    );

    return Promise.all(
        displayFormRefs.map((displayFormRef) =>
            context.backend
                .workspace(context.workspace)
                .attributes()
                .getAttributeByDisplayForm(displayFormRef),
        ),
    ).catch((err) => {
        // Convert from AnalyticalBackendError to GoodDataSdkError
        throw convertError(err);
    });
}
