// (C) 2020-2022 GoodData Corporation

import {
    filterObjRef,
    IAttributeFilter,
    IDateFilter,
    IFilter,
    isAllTimeDateFilter,
    isAttributeFilter,
    isDateFilter,
    ObjRef,
    dashboardFilterReferenceObjRef,
    IWidget,
} from "@gooddata/sdk-model";
import last from "lodash/last.js";
import zip from "lodash/zip.js";

type NormalizeIds = (refs: ObjRef[]) => Promise<string[]>;

/**
 * Performs widget filter resolution:
 * - removes all attribute filters hit by ignoreDashboardFilters
 * - removes all date filters for date dimension different than dateDataSet
 * - picks the last date filter for the dateDataSet dimension
 *   - if it is all time, removes all date filters
 *   - otherwise returns the last date filter specified
 *
 * @param widget - widget to resolve filters for
 * @param filters - filters to try
 * @param normalizeIds - function providing normalization of any ObjRef to identifier
 * @internal
 */
export async function resolveWidgetFilters(
    filters: IFilter[],
    ignoreDashboardFilters: IWidget["ignoreDashboardFilters"],
    dateDataSet: IWidget["dateDataSet"],
    normalizeIds: NormalizeIds,
): Promise<IFilter[]> {
    const dateFilters = filters.filter(isDateFilter);
    const attributeFilters = filters.filter(isAttributeFilter);

    const isIgnorableFilter = (obj: unknown): obj is IDateFilter | IAttributeFilter =>
        isDateFilter(obj) || isAttributeFilter(obj);

    if (!dateFilters.length && !attributeFilters.length) {
        return filters;
    }

    const [dateFiltersToKeep, attributeFiltersToKeep] = await Promise.all([
        getRelevantDateFiltersForWidget(dateFilters, dateDataSet, normalizeIds),
        getRelevantAttributeFiltersForWidget(attributeFilters, ignoreDashboardFilters, normalizeIds),
    ]);

    const filtersToKeep = [...dateFiltersToKeep, ...attributeFiltersToKeep];

    // filter the original filter array to maintain order of the items
    return filters.filter((filter) => !isIgnorableFilter(filter) || filtersToKeep.includes(filter));
}

async function getRelevantDateFiltersForWidget(
    filters: IDateFilter[],
    dateDataSet: IWidget["dateDataSet"],
    normalizeIds: NormalizeIds,
): Promise<IDateFilter[]> {
    if (!dateDataSet || !filters.length || filters.every(isAllTimeDateFilter)) {
        return [];
    }

    const [dateDatasetId, ...filterIds] = await normalizeIds([
        dateDataSet,
        ...filters.map((filter) => filterObjRef(filter)!),
    ]);

    const withRelevantDimension = zip(filters, filterIds)
        .filter(([, id]) => dateDatasetId === id)
        .map(([filter]) => filter!);

    const candidate = last(withRelevantDimension);
    return !candidate || isAllTimeDateFilter(candidate) ? [] : [candidate];
}

async function getRelevantAttributeFiltersForWidget(
    filters: IAttributeFilter[],
    ignoreDashboardFilters: IWidget["ignoreDashboardFilters"],
    normalizeIds: NormalizeIds,
): Promise<IAttributeFilter[]> {
    if (!ignoreDashboardFilters.length) {
        return filters;
    }

    if (!filters.length) {
        return [];
    }

    // get all the necessary uris in one call by concatenating both arrays
    const ids = await normalizeIds([
        ...ignoreDashboardFilters.map(dashboardFilterReferenceObjRef),
        ...filters.map((filter) => filterObjRef(filter)!),
    ]);

    // re-split the uris array to the two parts corresponding to the original arrays
    const divide = ignoreDashboardFilters.length;
    const ignoredIds = ids.slice(0, divide);
    const filterIds = ids.slice(divide);

    return zip(filters, filterIds)
        .filter(([, id]) => !ignoredIds.includes(id!))
        .map(([filter]) => filter!);
}
