// (C) 2022 GoodData Corporation
import { IDashboardAttributeFilter } from "@gooddata/sdk-model";

/**
 * Creates and mapping of attribute filter local identifier to connecting attributes matrix indexes.
 */
export function loadFiltersToIndexMapping(filters: IDashboardAttributeFilter[]) {
    const mapping: Record<string, number> = {};

    let lastIndex = 0;

    filters.forEach((filter) => (mapping[filter.attributeFilter.localIdentifier!] = lastIndex++));

    return mapping;
}
