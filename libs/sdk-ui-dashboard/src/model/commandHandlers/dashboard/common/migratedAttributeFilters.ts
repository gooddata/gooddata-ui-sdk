// (C) 2025 GoodData Corporation

import {
    type IDashboardAttributeFilter,
    type IFilterContextDefinition,
    areObjRefsEqual,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";

/**
 * Returns attribute filters that were ad-hoc migrated (non-primary label information was moved from
 * filter's displayForm to dashboard's attribute filter config).
 *
 * @param persistedAttributeFilters - attribute filters that are persisted in metadata
 * @param currentAttributeFilters - attribute filters that are in the current state
 * @param crossFilteringFiltersLocalIdentifiers - current filters that have cross filtering applied
 */
export function getMigratedAttributeFilters(
    persistedAttributeFilters: IDashboardAttributeFilter[] = [],
    currentAttributeFilters: IDashboardAttributeFilter[] = [],
    crossFilteringFiltersLocalIdentifiers: string[] = [],
): IDashboardAttributeFilter[] {
    return currentAttributeFilters
        .filter(
            (currentFilter) =>
                !crossFilteringFiltersLocalIdentifiers.includes(
                    currentFilter.attributeFilter.localIdentifier!,
                ),
        )
        .filter((currentFilter) => {
            const persistedFilter = persistedAttributeFilters.find(
                (persistedFilter) =>
                    persistedFilter.attributeFilter.localIdentifier ===
                    currentFilter.attributeFilter.localIdentifier,
            );
            return !areObjRefsEqual(
                persistedFilter?.attributeFilter.displayForm,
                currentFilter.attributeFilter.displayForm,
            );
        });
}

/**
 * Returns provided filter context with provided filters merged into (the filters are matched by
 * local identifier).
 * @param filterContext - the filter context that will get the provided filters merged into
 * @param migratedAttributeFilters - filters that should be merged into the provided filter context
 */
export const mergedMigratedAttributeFilters = (
    filterContext: IFilterContextDefinition,
    migratedAttributeFilters: IDashboardAttributeFilter[],
): IFilterContextDefinition => ({
    ...filterContext,
    filters: filterContext.filters.map((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            const migratedFilter = migratedAttributeFilters.find(
                (migratedFilter) =>
                    migratedFilter.attributeFilter.localIdentifier === filter.attributeFilter.localIdentifier,
            );
            return migratedFilter ?? filter;
        }
        return filter;
    }),
});
