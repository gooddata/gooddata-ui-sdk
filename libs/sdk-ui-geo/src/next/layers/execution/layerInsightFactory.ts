// (C) 2025 GoodData Corporation

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
