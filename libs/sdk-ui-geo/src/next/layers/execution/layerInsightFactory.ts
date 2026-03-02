// (C) 2025-2026 GoodData Corporation

import { isEqual } from "lodash-es";

import {
    type IBucket,
    type IFilter,
    type IInsightDefinition,
    type INullableFilter,
    type ISortItem,
    newInsightDefinition,
} from "@gooddata/sdk-model";

const GEO_LAYER_VIZ_URL = "local:geo.layer";

/**
 * Creates a synthetic insight used to execute an individual geo layer.
 *
 * @internal
 */
export function createLayerInsight(params: {
    buckets: IBucket[];
    layerName?: string;
    filters?: INullableFilter[];
    sortBy?: ISortItem[];
}): IInsightDefinition {
    const { buckets, layerName, filters, sortBy } = params;
    const sanitizedFilters = sanitizeLayerFilters(filters);
    const sanitizedSorts = sortBy ?? [];

    return newInsightDefinition(GEO_LAYER_VIZ_URL, (builder) => {
        const withTitle = layerName ? builder.title(layerName) : builder;

        return withTitle.buckets(buckets).filters(sanitizedFilters).sorts(sanitizedSorts);
    });
}

/**
 * Removes null/undefined filters before storing them in an insight definition.
 *
 * @internal
 */
export function sanitizeLayerFilters(filters?: INullableFilter[]): IFilter[] {
    return (filters ?? []).filter((filter): filter is IFilter => Boolean(filter));
}

/**
 * Removes null/undefined filters while preserving the nullable type expected by execution factories.
 *
 * @internal
 */
export function sanitizeGlobalFilters(filters?: INullableFilter[]): INullableFilter[] {
    return (filters ?? []).filter((filter): filter is INullableFilter => Boolean(filter));
}

/**
 * Removes global filters that are exact duplicates of layer filters.
 *
 * @remarks
 * Layer filters are part of the synthetic layer insight; global filters are passed separately
 * to `forInsight(...)`. Exact duplicates in both arrays would otherwise be concatenated by
 * generic filter merge logic and cause avoidable execution fingerprint drift.
 *
 * @internal
 */
export function sanitizeDeduplicatedGlobalFilters(
    layerFilters?: INullableFilter[],
    globalFilters?: INullableFilter[],
): INullableFilter[] {
    const sanitizedLayerFilters = sanitizeLayerFilters(layerFilters);
    const sanitizedGlobalFilters = sanitizeGlobalFilters(globalFilters);

    return sanitizedGlobalFilters.filter(
        (globalFilter) => !sanitizedLayerFilters.some((layerFilter) => isEqual(layerFilter, globalFilter)),
    );
}
