// (C) 2022 GoodData Corporation
import {
    ElementsQueryOptionsElementsSpecification,
    IElementsQueryAttributeFilter,
    IElementsQueryResult,
} from "@gooddata/sdk-backend-spi";
import {
    attributeElementsIsEmpty,
    IAttributeElements,
    IAttributeMetadataObject,
    IMeasure,
    IRelativeDateFilter,
    newNegativeAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";

import { AttributeFilterStoreContext } from "../types";

/**
 * @internal
 */
export interface ILoadAttributeElementsOptions {
    displayFormRef: ObjRef;
    offset?: number;
    limit?: number;
    search?: string;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[];
    limitingMeasures?: IMeasure[];
    limitingDateFilters?: IRelativeDateFilter[];
    elements?: ElementsQueryOptionsElementsSpecification;
}

/**
 * @internal
 */
export async function loadAttributeElements(
    context: AttributeFilterStoreContext,
    {
        displayFormRef,
        limit,
        offset,
        limitingAttributeFilters,
        limitingDateFilters,
        limitingMeasures,
        search,
        elements,
    }: ILoadAttributeElementsOptions,
    hiddenElementsInfo: {
        hiddenElements: IAttributeElements;
        attribute: IAttributeMetadataObject;
    },
): Promise<IElementsQueryResult> {
    const { backend, workspace } = context;

    let loader = backend.workspace(workspace).attributes().elements().forDisplayForm(displayFormRef);
    if (limit) {
        loader = loader.withLimit(limit);
    }
    if (offset) {
        loader = loader.withOffset(offset);
    }
    if (search || elements) {
        loader = loader.withOptions({ filter: search, elements });
    }
    if (limitingDateFilters) {
        loader = loader.withDateFilters(limitingDateFilters);
    }

    const effectiveLimitingAttributeFilters = getLimitingAttributeFilters(
        displayFormRef,
        limitingAttributeFilters,
        hiddenElementsInfo.hiddenElements,
        hiddenElementsInfo.attribute,
    );

    if (effectiveLimitingAttributeFilters.length) {
        loader = loader.withAttributeFilters(effectiveLimitingAttributeFilters);
    }

    if (limitingMeasures) {
        loader = loader.withMeasures(limitingMeasures);
    }

    return loader.query();
}

function getLimitingAttributeFilters(
    displayFormRef: ObjRef,
    limitingAttributeFilters: IElementsQueryAttributeFilter[] | undefined,
    hiddenElements: IAttributeElements,
    attribute: IAttributeMetadataObject,
): IElementsQueryAttributeFilter[] {
    if (attributeElementsIsEmpty(hiddenElements)) {
        return limitingAttributeFilters ?? [];
    }

    // add a virtual parent filter to get rid of the hidden elements
    // this is the only way that does not mess up offsets since it is handled by the server "natively"
    const hiddenElementsVirtualFilter: IElementsQueryAttributeFilter = {
        attributeFilter: newNegativeAttributeFilter(displayFormRef, hiddenElements),
        overAttribute: attribute.ref,
    };

    return [hiddenElementsVirtualFilter, ...(limitingAttributeFilters ?? [])];
}
