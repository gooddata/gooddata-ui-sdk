// (C) 2022 GoodData Corporation
import {
    ElementsQueryOptionsElementsSpecification,
    IElementsQueryAttributeFilter,
    IElementsQueryResult,
} from "@gooddata/sdk-backend-spi";
import { IMeasure, IRelativeDateFilter, ObjRef } from "@gooddata/sdk-model";

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
): Promise<IElementsQueryResult> {
    const { backend, workspace } = context;

    let loader = backend.workspace(workspace).attributes().elements().forDisplayForm(displayFormRef);
    if (limit) {
        loader = loader.withLimit(limit);
    }
    if (offset) {
        loader = loader.withOffset(limit);
    }
    if (search || elements) {
        loader = loader.withOptions({ filter: search, elements });
    }
    if (limitingDateFilters) {
        loader = loader.withDateFilters(limitingDateFilters);
    }
    if (limitingAttributeFilters) {
        loader = loader.withAttributeFilters(limitingAttributeFilters);
    }
    if (limitingMeasures) {
        loader = loader.withMeasures(limitingMeasures);
    }

    return loader.query();
}
