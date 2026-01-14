// (C) 2020-2026 GoodData Corporation

import { zip } from "lodash-es";

import {
    type IAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDateFilter,
    type IFilter,
    type IWidget,
    type ObjRef,
    dashboardFilterReferenceObjRef,
    filterLocalIdentifier,
    filterObjRef,
    isAllTimeDateFilter,
    isAttributeFilter,
    isDateFilter,
} from "@gooddata/sdk-model";

type NormalizeIds = (refs: ObjRef[]) => string[];

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
export function resolveWidgetFilters(
    filters: IFilter[],
    ignoreDashboardFilters: IWidget["ignoreDashboardFilters"],
    dateDataSet: IWidget["dateDataSet"],
    normalizeIds: NormalizeIds,
    attributeFilterConfigs: IDashboardAttributeFilterConfig[] = [],
): IFilter[] {
    const dateFilters = filters.filter(isDateFilter);
    const attributeFilters = filters.filter(isAttributeFilter);

    const isIgnorableFilter = (obj: unknown): obj is IDateFilter | IAttributeFilter =>
        isDateFilter(obj) || isAttributeFilter(obj);

    if (!dateFilters.length && !attributeFilters.length) {
        return filters;
    }

    const dateFiltersToKeep = getRelevantDateFiltersForWidget(dateFilters, dateDataSet, normalizeIds);
    const attributeFiltersToKeep = getRelevantAttributeFiltersForWidget(
        attributeFilters,
        ignoreDashboardFilters,
        normalizeIds,
        attributeFilterConfigs,
    );

    const filtersToKeep = [...dateFiltersToKeep, ...attributeFiltersToKeep];

    // filter the original filter array to maintain order of the items
    return filters.filter((filter) => !isIgnorableFilter(filter) || filtersToKeep.includes(filter));
}

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
export function resolveWidgetFiltersWithMultipleDateFilters(
    commonDateFilters: IDateFilter[],
    otherFilters: IFilter[],
    ignoreDashboardFilters: IWidget["ignoreDashboardFilters"],
    dateDataSet: IWidget["dateDataSet"],
    normalizeIds: NormalizeIds,
    attributeFilterConfigs: IDashboardAttributeFilterConfig[],
): IFilter[] {
    const dateFilters = otherFilters.filter(isDateFilter);
    const attributeFilters = otherFilters.filter(isAttributeFilter);

    const isIgnorableFilter = (obj: unknown): obj is IDateFilter | IAttributeFilter =>
        isDateFilter(obj) || isAttributeFilter(obj);

    if (!dateFilters.length && !attributeFilters.length) {
        return otherFilters;
    }

    const commonDateFiltersToKeep = getRelevantDateFiltersForWidget(
        commonDateFilters,
        dateDataSet,
        normalizeIds,
    );
    const dateFiltersToKeep = getRelevantDateFiltersWithDimensionForWidget(
        dateFilters,
        ignoreDashboardFilters,
        normalizeIds,
    );
    const attributeFiltersToKeep = getRelevantAttributeFiltersForWidget(
        attributeFilters,
        ignoreDashboardFilters,
        normalizeIds,
        attributeFilterConfigs,
    );

    const filtersToKeep = [...dateFiltersToKeep, ...attributeFiltersToKeep];
    // filter the original filter arrays to maintain order of the items
    const keptCommonDateFilters = commonDateFilters.filter((filter) =>
        commonDateFiltersToKeep.includes(filter),
    );

    const keptOtherFilters = otherFilters.filter(
        (filter) => !isIgnorableFilter(filter) || filtersToKeep.includes(filter),
    );

    return [...keptCommonDateFilters, ...keptOtherFilters];
}

function getRelevantDateFiltersForWidget(
    filters: IDateFilter[],
    dateDataSet: IWidget["dateDataSet"],
    normalizeIds: NormalizeIds,
): IDateFilter[] {
    if (!dateDataSet || !filters.length || filters.every(isAllTimeDateFilter)) {
        return [];
    }

    const [dateDatasetId, ...filterIds] = normalizeIds([
        dateDataSet,
        ...filters.map((filter) => filterObjRef(filter)),
    ]);

    const withRelevantDimension = zip(filters, filterIds)
        .filter(([, id]) => dateDatasetId === id)
        .map(([filter]) => filter!);

    const candidate = withRelevantDimension.at(-1);
    return !candidate || isAllTimeDateFilter(candidate) ? [] : [candidate];
}

function getRelevantDateFiltersWithDimensionForWidget(
    filters: IDateFilter[],
    ignoreDashboardFilters: IWidget["ignoreDashboardFilters"],
    normalizeIds: NormalizeIds,
): IDateFilter[] {
    if (!ignoreDashboardFilters.length) {
        return filters;
    }

    if (!filters.length) {
        return [];
    }

    // get all the necessary uris in one call by concatenating both arrays
    const ids = normalizeIds([
        ...ignoreDashboardFilters.map(dashboardFilterReferenceObjRef),
        ...filters.map((filter) => filterObjRef(filter)),
    ]);

    // re-split the uris array to the two parts corresponding to the original arrays
    const divide = ignoreDashboardFilters.length;
    const ignoredIds = ids.slice(0, divide);
    const filterIds = ids.slice(divide);

    return zip(filters, filterIds)
        .filter(([, id]) => !ignoredIds.includes(id!))
        .map(([filter]) => filter!)
        .filter((f) => !isAllTimeDateFilter(f));
}

function getRelevantAttributeFiltersForWidget(
    filters: IAttributeFilter[],
    ignoreDashboardFilters: IWidget["ignoreDashboardFilters"],
    normalizeIds: NormalizeIds,
    attributeFilterConfigs: IDashboardAttributeFilterConfig[],
): IAttributeFilter[] {
    if (!ignoreDashboardFilters.length) {
        return filters;
    }

    if (!filters.length) {
        return [];
    }

    // get all the necessary uris in one call by concatenating both arrays
    const ids = normalizeIds([
        ...ignoreDashboardFilters.map(dashboardFilterReferenceObjRef),
        ...filters.map((filter) => filterObjRef(filter)),
        ...attributeFilterConfigs
            .filter((config) => !!config.displayAsLabel)
            .map((config) => config.displayAsLabel!),
    ]);

    // re-split the uris array to the two parts corresponding to the original arrays
    const divide = ignoreDashboardFilters.length;
    const ignoredIds = ids.slice(0, divide);
    const filterIds = ids.slice(divide, divide + filters.length);
    const configIds = ids.slice(divide + filters.length);

    const normalizedConfig = attributeFilterConfigs
        .filter((config) => !!config.displayAsLabel)
        .map((config, index) => ({
            ...config,
            normalizedDisplayAsLabel: configIds[index],
        }));

    return zip(filters, filterIds)
        .filter(([filter, id]) => {
            const config = normalizedConfig.find(
                (config) => config.localIdentifier === filterLocalIdentifier(filter!),
            );
            return (
                !ignoredIds.includes(id!) &&
                (!config || !ignoredIds.includes(config.normalizedDisplayAsLabel))
            );
        })
        .map(([filter]) => filter!);
}
