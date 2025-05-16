// (C) 2020-2025 GoodData Corporation

import {
    filterIsEmpty,
    filterLocalIdentifier,
    IFilter,
    isAllTimeDateFilter,
    isAttributeFilter,
} from "@gooddata/sdk-model";
import { ICrossFilteringItem } from "../../store/index.js";

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
function removeAllTimeDateFilter(filters: IFilter[]): IFilter[] {
    return filters.filter((f) => !isAllTimeDateFilter(f));
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
 */
export function sanitizeWidgetFilters(
    filters: IFilter[],
    crossFilteringItems: ICrossFilteringItem[],
    enableAutomationFilterContext: boolean,
): IFilter[] {
    const widgetFiltersWithoutCrossFiltering = removeCrossFilteringFilters(filters, crossFilteringItems);
    const widgetFiltersWithoutAllTimeDateFilter = removeAllTimeDateFilter(widgetFiltersWithoutCrossFiltering);
    return enableAutomationFilterContext
        ? removeEmptyAttributeFilters(widgetFiltersWithoutAllTimeDateFilter)
        : widgetFiltersWithoutAllTimeDateFilter;
}
