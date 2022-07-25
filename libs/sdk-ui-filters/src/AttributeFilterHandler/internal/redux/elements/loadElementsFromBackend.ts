// (C) 2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import {
    IElementsQueryAttributeFilter,
    IElementsQueryOptions,
    IElementsQueryResult,
} from "@gooddata/sdk-backend-spi";
import {
    attributeElementsIsEmpty,
    IAttributeElements,
    IAttributeMetadataObject,
    newNegativeAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import { convertError } from "@gooddata/sdk-ui";

import { ILoadElementsOptions } from "../../../types";
import { AttributeFilterHandlerStoreContext } from "../store/types";
import { IHiddenElementsInfo } from "./types";

/**
 * @internal
 */
export function loadElementsFromBackend(
    context: AttributeFilterHandlerStoreContext,
    options: ILoadElementsOptions & { displayFormRef: ObjRef },
    hiddenElementsInfo: IHiddenElementsInfo,
): Promise<IElementsQueryResult> {
    const { backend, workspace } = context;
    const {
        displayFormRef,
        elements,
        limit,
        limitingAttributeFilters,
        limitingDateFilters,
        limitingMeasures,
        offset,
        search,
        order,
        includeTotalCountWithoutFilters,
    } = options;

    let loader = backend.workspace(workspace).attributes().elements().forDisplayForm(displayFormRef);
    const loaderOptions: IElementsQueryOptions = {};

    if (limit) {
        loader = loader.withLimit(limit);
    }
    if (offset) {
        loader = loader.withOffset(offset);
    }
    if (search) {
        loaderOptions.filter = search;
    }
    if (elements) {
        loaderOptions.elements = elements;
    }
    if (order) {
        loaderOptions.order = order;
    }
    if (includeTotalCountWithoutFilters) {
        loaderOptions.includeTotalCountWithoutFilters = includeTotalCountWithoutFilters;
    }
    if (!isEmpty(loaderOptions)) {
        loader = loader.withOptions(loaderOptions);
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

    return loader.query().catch((error) => {
        throw convertError(error);
    });
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
