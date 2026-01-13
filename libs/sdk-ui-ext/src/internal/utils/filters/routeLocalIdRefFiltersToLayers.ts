// (C) 2026 GoodData Corporation

import {
    type IBucket,
    type IFilter,
    attributeLocalId,
    bucketItems,
    isAttribute,
    isLocalIdRef,
    isMeasure,
    isMeasureValueFilter,
    isRankingFilter,
    measureLocalId,
} from "@gooddata/sdk-model";

export interface ILayerBucketsContext {
    id: string;
    buckets: IBucket[];
}

export interface ILayerLocalIds {
    attributeLocalIds: Set<string>;
    measureLocalIds: Set<string>;
}

export interface IRoutedLocalIdRefFilters {
    /**
     * Filters that are safe to apply to all layers (attribute/date filters + measure-based filters that do NOT use localIdRef).
     */
    globalFilters: IFilter[];
    /**
     * Measure-based filters (MVF/ranking) that use localIdRef, routed to layers where referenced localIds exist.
     */
    routedByLayerId: Map<string, IFilter[]>;
}

function collectLayerLocalIdsFromBuckets(buckets: IBucket[]): ILayerLocalIds {
    const attributeLocalIds = new Set<string>();
    const measureLocalIds = new Set<string>();

    for (const bucket of buckets) {
        for (const item of bucketItems(bucket)) {
            if (isAttribute(item)) {
                attributeLocalIds.add(attributeLocalId(item));
            } else if (isMeasure(item)) {
                measureLocalIds.add(measureLocalId(item));
            }
        }
    }

    return { attributeLocalIds, measureLocalIds };
}

function isLocalIdRefBasedMeasureFilter(filter: IFilter): boolean {
    if (isMeasureValueFilter(filter)) {
        const { measure, dimensionality = [] } = filter.measureValueFilter;
        return isLocalIdRef(measure) || dimensionality.some(isLocalIdRef);
    }

    if (isRankingFilter(filter)) {
        const { measure, attributes = [] } = filter.rankingFilter;
        return isLocalIdRef(measure) || attributes.some(isLocalIdRef);
    }

    return false;
}

function isMeasureFilterApplicableToLayer(filter: IFilter, layerLocalIds: ILayerLocalIds): boolean {
    if (isMeasureValueFilter(filter)) {
        const { measure, dimensionality = [] } = filter.measureValueFilter;

        const hasMissingMeasure =
            isLocalIdRef(measure) && !layerLocalIds.measureLocalIds.has(measure.localIdentifier);

        const hasMissingDimensionality = dimensionality
            .filter(isLocalIdRef)
            .some((ref) => !layerLocalIds.attributeLocalIds.has(ref.localIdentifier));

        return !hasMissingMeasure && !hasMissingDimensionality;
    }

    if (isRankingFilter(filter)) {
        const { measure, attributes = [] } = filter.rankingFilter;

        const hasMissingMeasure =
            isLocalIdRef(measure) && !layerLocalIds.measureLocalIds.has(measure.localIdentifier);

        const hasMissingAttributes = attributes
            .filter(isLocalIdRef)
            .some((ref) => !layerLocalIds.attributeLocalIds.has(ref.localIdentifier));

        return !hasMissingMeasure && !hasMissingAttributes;
    }

    return true;
}

/**
 * Splits filters into:
 * - filters safe to apply to all layers (includes measure-based filters that do not use localIdRef)
 * - measure-based filters using localIdRef (MVF/ranking) routed to layers where referenced localIds exist
 */
export function routeLocalIdRefFiltersToLayers(
    globalFilters: IFilter[],
    layers: ILayerBucketsContext[],
): IRoutedLocalIdRefFilters {
    const routable = globalFilters.filter(isLocalIdRefBasedMeasureFilter);
    const safeGlobal = globalFilters.filter((f) => !isLocalIdRefBasedMeasureFilter(f));

    const routedByLayerId = new Map<string, IFilter[]>();
    for (const layer of layers) {
        const localIds = collectLayerLocalIdsFromBuckets(layer.buckets);
        const applicable = routable.filter((filter) => isMeasureFilterApplicableToLayer(filter, localIds));
        routedByLayerId.set(layer.id, applicable);
    }

    return { globalFilters: safeGlobal, routedByLayerId };
}
