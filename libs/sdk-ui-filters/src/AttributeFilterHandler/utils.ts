// (C) 2022-2026 GoodData Corporation

import { type IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    attributeElementsIsEmpty,
    filterAttributeElements,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { _isEmpty } from "@gooddata/util";

/**
 * @internal
 */
export function isLimitingAttributeFiltersEmpty(limitingAttributeFilters: IElementsQueryAttributeFilter[]) {
    return (
        _isEmpty(limitingAttributeFilters) ||
        limitingAttributeFilters.every((limitingAttributeFilter) =>
            isNegativeAttributeFilter(limitingAttributeFilter.attributeFilter)
                ? attributeElementsIsEmpty(filterAttributeElements(limitingAttributeFilter.attributeFilter))
                : false,
        )
    );
}
