// (C) 2020-2026 GoodData Corporation

import {
    type IFilter,
    filterIsEmpty,
    filterLocalIdentifier,
    isAttributeFilter,
    isNoopAllTimeDateFilter,
} from "@gooddata/sdk-model";

import { type ICrossFilteringItem } from "../../store/drill/types.js";

/**
 * @internal
 */
function removeCrossFilteringFilters(
    filters: IFilter[],
    crossFilteringItems: ICrossFilteringItem[],
): IFilter[] {
    const crossFilteringFilterLocalIdentifiers = crossFilteringItems.flatMap((c) => c.filterLocalIdentifiers);
    return filters.filter((f) => {
        const filterLocalId = filterLocalIdentifier(f);
        return filterLocalId ? !crossFilteringFilterLocalIdentifiers.includes(filterLocalId) : true;
    });
}

/**
 * @internal
 */
export function sanitizeWidgetFilters(
    filters: IFilter[],
    crossFilteringItems: ICrossFilteringItem[],
): IFilter[] {
    const withoutCrossFiltering = removeCrossFilteringFilters(filters, crossFilteringItems);
    const withoutAllTimeDateFilters = removeAllTimeDateFilters(withoutCrossFiltering);
    return removeEmptyAttributeFilters(withoutAllTimeDateFilters);
}

/**
 * @internal
 */
function removeEmptyAttributeFilters(filters: IFilter[]): IFilter[] {
    return filters.filter((f) => {
        if (isAttributeFilter(f)) {
            return !filterIsEmpty(f);
        }
        return true;
    });
}

/**
 * @internal
 * @returns
 */
function removeAllTimeDateFilters(filters: IFilter[]): IFilter[] {
    return filters.filter((f) => !isNoopAllTimeDateFilter(f));
}
