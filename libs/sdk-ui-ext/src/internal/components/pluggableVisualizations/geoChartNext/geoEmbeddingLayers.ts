// (C) 2025-2026 GoodData Corporation

import {
    type IFilter,
    type IInsightDefinition,
    insightBuckets,
    insightFilters,
    insightLayers,
    insightProperties,
    insightSorts,
} from "@gooddata/sdk-model";
import {
    type IGeoLayer,
    type IGeoLayerArea,
    type IGeoLayerPushpin,
    insightLayerToGeoLayer,
} from "@gooddata/sdk-ui-geo/next";

import { routeLocalIdRefFiltersToLayers } from "../../../utils/filters/routeLocalIdRefFiltersToLayers.js";

/**
 * Builds the layer definitions for GeoChartNext programmatic embedding.
 *
 * @internal
 */
export function buildGeoChartNextLayers(
    insight: IInsightDefinition,
    primaryType: "area" | "pushpin",
): IGeoLayer[] {
    const sorts = insightSorts(insight);
    const primaryLayerDefinition = {
        id: "primary",
        type: primaryType,
        buckets: insightBuckets(insight),
        ...(sorts.length ? { sorts } : {}),
        properties: insightProperties(insight),
    };

    const primaryLayer = insightLayerToGeoLayer(primaryLayerDefinition);
    const additionalLayers = insightLayers(insight)
        .map((definition) => insightLayerToGeoLayer(definition))
        .filter((layer): layer is IGeoLayer => layer !== null);

    const layers = primaryLayer ? [primaryLayer, ...additionalLayers] : additionalLayers;
    const layerContexts = [
        { id: "primary", buckets: insightBuckets(insight) },
        ...insightLayers(insight).map((l) => ({ id: l.id, buckets: l.buckets })),
    ];
    const { routedByLayerId } = routeLocalIdRefFiltersToLayers(insightFilters(insight), layerContexts);

    return layers
        .map((layer) => attachLayerSpecificFilters(layer, routedByLayerId))
        .map(sanitizeLayerForEmbedding);
}

export function buildGeoChartNextGlobalFilters(insight: IInsightDefinition): IFilter[] {
    const layerContexts = [
        { id: "primary", buckets: insightBuckets(insight) },
        ...insightLayers(insight).map((l) => ({ id: l.id, buckets: l.buckets })),
    ];
    return routeLocalIdRefFiltersToLayers(insightFilters(insight), layerContexts).globalFilters;
}

function attachLayerSpecificFilters(layer: IGeoLayer, routedByLayerId: Map<string, IFilter[]>): IGeoLayer {
    const layerMeasureFilters = routedByLayerId.get(layer.id) ?? [];
    if (!layerMeasureFilters.length) {
        return layer;
    }

    const existingLayerFilters = layer.filters ?? [];
    return {
        ...layer,
        filters: [...existingLayerFilters, ...layerMeasureFilters],
    };
}

function sanitizeLayerForEmbedding(layer: IGeoLayer): IGeoLayer {
    const base = {
        id: layer.id,
        type: layer.type,
        ...(layer.name ? { name: layer.name } : {}),
        ...(layer.color ? { color: layer.color } : {}),
        ...(layer.segmentBy ? { segmentBy: layer.segmentBy } : {}),
        ...(layer.tooltipText ? { tooltipText: layer.tooltipText } : {}),
        ...(layer.filters?.some((f) => f !== null && f !== undefined) ? { filters: layer.filters } : {}),
        ...(layer.sortBy?.length ? { sortBy: layer.sortBy } : {}),
    };

    if (layer.type === "area") {
        const areaLayer: IGeoLayerArea = {
            ...base,
            type: "area",
            area: layer.area,
        };
        return areaLayer;
    }

    const pushpinLayer: IGeoLayerPushpin = {
        ...base,
        type: "pushpin",
        latitude: layer.latitude,
        longitude: layer.longitude,
        ...(layer.size ? { size: layer.size } : {}),
    };
    return pushpinLayer;
}
