// (C) 2025-2026 GoodData Corporation

import {
    type IFilter,
    type IInsightDefinition,
    attributeDisplayFormRef,
    attributeLocalId,
    insightBuckets,
    insightFilters,
    insightLayers,
    insightProperties,
    insightSorts,
    isLocalIdRef,
    isMeasureValueFilter,
    isRankingFilter,
    newAttribute,
} from "@gooddata/sdk-model";
import { type IGeoLayer, type IGeoLayerArea, type IGeoLayerPushpin } from "@gooddata/sdk-ui-geo";
import { insightLayerToGeoLayer } from "@gooddata/sdk-ui-geo/internal";

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
    const layerConfig =
        layer.config?.colorPalette || layer.config?.colorMapping?.length
            ? {
                  ...(layer.config?.colorPalette ? { colorPalette: layer.config.colorPalette } : {}),
                  ...(layer.config?.colorMapping?.length ? { colorMapping: layer.config.colorMapping } : {}),
              }
            : undefined;
    const base = {
        id: layer.id,
        type: layer.type,
        ...(layer.name ? { name: layer.name } : {}),
        ...(layer.color ? { color: layer.color } : {}),
        ...(layer.segmentBy ? { segmentBy: layer.segmentBy } : {}),
        ...(layer.tooltipText ? { tooltipText: layer.tooltipText } : {}),
        ...(layerConfig ? { config: layerConfig } : {}),
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

    const { latitude, longitude } = sanitizePushpinCoordinatesForEmbedding(layer);
    const pushpinLayer: IGeoLayerPushpin = {
        ...base,
        type: "pushpin",
        latitude,
        longitude,
        ...(layer.size ? { size: layer.size } : {}),
    };
    return pushpinLayer;
}

function sanitizePushpinCoordinatesForEmbedding(layer: IGeoLayerPushpin): {
    latitude: IGeoLayerPushpin["latitude"];
    longitude: IGeoLayerPushpin["longitude"];
} {
    const latitudeLocalId = attributeLocalId(layer.latitude);
    const longitudeLocalId = attributeLocalId(layer.longitude);
    const layerFilters = layer.filters?.filter((filter): filter is IFilter => Boolean(filter));

    const shouldPreserveLatitudeLocalId = isLocalIdReferencedInLayerFilters(layerFilters, latitudeLocalId);
    const shouldPreserveLongitudeLocalId = isLocalIdReferencedInLayerFilters(layerFilters, longitudeLocalId);

    const latitude = shouldPreserveLatitudeLocalId
        ? layer.latitude
        : newAttribute(attributeDisplayFormRef(layer.latitude), (builder) => builder.localId("latitude_df"));
    const longitude = shouldPreserveLongitudeLocalId
        ? layer.longitude
        : newAttribute(attributeDisplayFormRef(layer.longitude), (builder) =>
              builder.localId("longitude_df"),
          );

    return { latitude, longitude };
}

function isLocalIdReferencedInLayerFilters(filters: IFilter[] | undefined, localId: string): boolean {
    if (!filters?.length) {
        return false;
    }

    return filters.some((filter) => {
        if (isMeasureValueFilter(filter)) {
            return (
                filter.measureValueFilter.dimensionality?.some(
                    (ref) => isLocalIdRef(ref) && ref.localIdentifier === localId,
                ) ?? false
            );
        }

        if (isRankingFilter(filter)) {
            return (
                filter.rankingFilter.attributes?.some(
                    (ref) => isLocalIdRef(ref) && ref.localIdentifier === localId,
                ) ?? false
            );
        }

        return false;
    });
}
