// (C) 2026 GoodData Corporation

import { type FilterContextItem, type IFilter, isFilter, isFilterContextItem } from "@gooddata/sdk-model";

export function isFilterContextItems(filters: unknown[]): filters is FilterContextItem[] {
    return filters.every(isFilterContextItem);
}

export function isFilters(filters: unknown[]): filters is IFilter[] {
    return filters.every(isFilter);
}
