// (C) 2023-2025 GoodData Corporation
import {
    type FilterContextItem,
    type IDashboardAttributeFilter,
    getSelectedElementsCount,
    isAttributeElementsByRef,
    isDashboardAttributeFilter,
    isNegativeDashboardAttributeFilter,
    isSingleSelectionFilter,
} from "@gooddata/sdk-model";

const hasMoreThenOneSelectedElement = (filter: IDashboardAttributeFilter) =>
    getSelectedElementsCount(filter) > 1;

const clearSelection = (filter: IDashboardAttributeFilter) => {
    if (isAttributeElementsByRef(filter.attributeFilter.attributeElements)) {
        filter.attributeFilter.attributeElements.uris = [];
    } else {
        filter.attributeFilter.attributeElements.values = [];
    }
    return filter;
};

export function sanitizeSelectionMode(filters: FilterContextItem[]): FilterContextItem[] {
    return filters.map((filter) => {
        if (isDashboardAttributeFilter(filter) && isSingleSelectionFilter(filter)) {
            const validFilter = filter;
            if (isNegativeDashboardAttributeFilter(filter)) {
                console.error(
                    `Attribute filter ${
                        filter.attributeFilter.localIdentifier || filter.attributeFilter.displayForm
                    } has invalid definition. Can not combine selectionMode single and negativeSelection. Resetting to None filter.`,
                );
                validFilter.attributeFilter.negativeSelection = false;
                clearSelection(validFilter);
            }
            if (hasMoreThenOneSelectedElement(filter)) {
                console.error(
                    `Attribute filter ${
                        filter.attributeFilter.localIdentifier || filter.attributeFilter.displayForm
                    } has invalid definition. When selectionMode is single filter should have max one selected item. Resetting to None filter.`,
                );
                clearSelection(validFilter);
            }
            return validFilter;
        }
        if (isDashboardAttributeFilter(filter)) {
            return {
                ...filter,
                attributeFilter: {
                    ...filter.attributeFilter,
                    selectionMode: filter.attributeFilter.selectionMode ?? "multi",
                },
            };
        }
        return filter;
    });
}
