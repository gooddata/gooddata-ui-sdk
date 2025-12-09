// (C) 2025 GoodData Corporation

import { isClusteringAllowed } from "./clustering/clustering.js";
import {
    createClusterLabels,
    createClusterPoints,
    createPushpinDataLayer,
    createUnclusterPoints,
} from "./layers.js";
import { createStylePlan } from "../../map/styleReconciliation/planBuilder.js";
import { reconcileStyle } from "../../map/styleReconciliation/reconcileStyle.js";
import { IGeoChartNextConfig } from "../../types/config/unified.js";
import { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import { removeLayerIfExists, removeSourceIfExists } from "../common/layerOps.js";
import { GeoJSONSourceSpecification, IMapFacade } from "../common/mapFacade.js";

/**
 * Generate unique layer IDs for a layer
 *
 * @internal
 */
export function getPushpinLayerIds(layerId: string) {
    return {
        sourceId: `pushpin-source-${layerId}`,
        pointLayerId: `pushpin-layer-${layerId}`,
        clusterLayerId: `cluster-layer-${layerId}`,
        clusterLabelsLayerId: `cluster-labels-${layerId}`,
        unclusterLayerId: `uncluster-layer-${layerId}`,
    };
}

/**
 * Syncs pushpin layer data to the map using pre-computed source.
 *
 * @param map - MapLibre map instance
 * @param layerId - Unique layer identifier
 * @param source - Pre-computed GeoJSON source specification
 * @param geoData - Transformed pushpin geo data (for layer creation)
 * @param config - Chart configuration
 *
 * @internal
 */
export function syncPushpinLayerToMap(
    map: IMapFacade,
    layerId: string,
    source: GeoJSONSourceSpecification,
    geoData: IPushpinGeoData,
    config: IGeoChartNextConfig,
): void {
    const ids = getPushpinLayerIds(layerId);
    const { points: geoPointsConfig = {} } = config;
    const hasClustering = isClusteringAllowed(geoData, geoPointsConfig.groupNearbyPoints);

    // Build plan using pre-computed source - no transformation needed
    const planBuilder = createStylePlan().addSource(ids.sourceId, source);

    if (hasClustering) {
        planBuilder
            .addLayer(createClusterPoints(ids.sourceId, ids.clusterLayerId))
            .addLayer(createClusterLabels(ids.sourceId, ids.clusterLabelsLayerId))
            .addLayer(createUnclusterPoints(ids.sourceId, ids.unclusterLayerId));
    } else {
        planBuilder.addLayer(createPushpinDataLayer(ids.sourceId, geoData, config, ids.pointLayerId));
    }

    const plan = planBuilder.build();

    // Use reconcileStyle to handle clustering toggle transitions
    // (removes all existing layers/sources before applying new plan)
    reconcileStyle(map, plan, {
        layers: [ids.pointLayerId, ids.clusterLayerId, ids.clusterLabelsLayerId, ids.unclusterLayerId],
        sources: [ids.sourceId],
    });
}

/**
 * Remove pushpin layer and its resources from the map
 *
 * @param map - MapLibre map instance
 * @param layerId - Unique layer identifier
 *
 * @internal
 */
export function removePushpinLayer(map: IMapFacade, layerId: string): void {
    const ids = getPushpinLayerIds(layerId);

    const layersToRemove = [
        ids.pointLayerId,
        ids.clusterLayerId,
        ids.clusterLabelsLayerId,
        ids.unclusterLayerId,
    ];

    layersToRemove.forEach((id) => removeLayerIfExists(map, id));
    removeSourceIfExists(map, ids.sourceId);
}
