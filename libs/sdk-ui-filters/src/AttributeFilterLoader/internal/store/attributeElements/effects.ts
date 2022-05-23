// (C) 2022 GoodData Corporation
import { IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IAttributeElements, ObjRef } from "@gooddata/sdk-model";

import { AttributeFilterStoreContext } from "../types";

/**
 * @internal
 */
interface ILoadAttributeElementsOptions {
    displayFormRef: ObjRef;
    elements?: IAttributeElements;
    offset?: number;
    limit?: number;
}

/**
 * @internal
 */
export async function loadAttributeElements(
    context: AttributeFilterStoreContext,
    { displayFormRef, elements, offset, limit }: ILoadAttributeElementsOptions,
): Promise<IElementsQueryResult> {
    let elementsLoader = context.backend
        .workspace(context.workspace)
        .attributes()
        .elements()
        .forDisplayForm(displayFormRef);

    if (elements) {
        elementsLoader = elementsLoader.withOptions({
            elements,
        });
    }

    if (offset) {
        elementsLoader = elementsLoader.withOffset(offset);
    }

    if (limit) {
        elementsLoader = elementsLoader.withLimit(limit);
    }

    return elementsLoader.query();
}
