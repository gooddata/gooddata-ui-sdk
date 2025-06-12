// (C) 2022 GoodData Corporation
import { convertError } from "@gooddata/sdk-ui";
import { filterObjRef, IAttributeMetadataObject } from "@gooddata/sdk-model";
import { AttributeFilterHandlerStoreContext } from "../store/types.js";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";

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
