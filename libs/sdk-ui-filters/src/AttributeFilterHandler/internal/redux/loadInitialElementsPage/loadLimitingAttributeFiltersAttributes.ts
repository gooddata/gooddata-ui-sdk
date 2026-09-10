// (C) 2022-2026 GoodData Corporation

import { type IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import { type IAttributeMetadataObject, filterObjRef } from "@gooddata/sdk-model";

import { loadAttributeByDisplayForm } from "../loadAttribute/loadAttributeByDisplayForm.js";
import { type IAttributeFilterHandlerStoreContext } from "../store/types.js";

/**
 * @internal
 */
export async function loadLimitingAttributeFiltersAttributes(
    context: IAttributeFilterHandlerStoreContext,
    limitingAttributeFilters: IElementsQueryAttributeFilter[],
): Promise<IAttributeMetadataObject[]> {
    const displayFormRefs = limitingAttributeFilters.map((limitingAttributeFilter) =>
        filterObjRef(limitingAttributeFilter.attributeFilter),
    );

    // loadAttributeByDisplayForm resolves a computed-attribute-typed display form through the
    // computedAttributes service (a computed attribute has no real label to look up) and converts
    // backend errors to GoodDataSdkError
    return Promise.all(
        displayFormRefs.map((displayFormRef) => loadAttributeByDisplayForm(context, displayFormRef)),
    );
}
