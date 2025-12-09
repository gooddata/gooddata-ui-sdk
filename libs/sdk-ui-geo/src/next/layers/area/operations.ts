// (C) 2025 GoodData Corporation

import { createAreaFillLayer, createAreaOutlineLayer } from "./layers.js";
import { createStylePlan } from "../../map/styleReconciliation/planBuilder.js";
import { applyStylePlan } from "../../map/styleReconciliation/reconcileStyle.js";
import { IGeoChartNextConfig } from "../../types/config/unified.js";
import { removeLayerIfExists, removeSourceIfExists } from "../common/layerOps.js";
import { GeoJSONSourceSpecification, IMapFacade } from "../common/mapFacade.js";

/**
 * Generate unique layer IDs for an area layer
 *
 * @internal
 */
export function getAreaLayerIds(layerId: string) {
    return {
        sourceId: `area-source-${layerId}`,
        fillLayerId: `area-fill-${layerId}`,
        outlineLayerId: `area-outline-${layerId}`,
    };
}

/**
 * Syncs area layer data to the map using pre-computed source.
 *
 * @param map - MapLibre map instance
 * @param layerId - Unique layer identifier
 * @param source - Pre-computed GeoJSON source specification
 * @param config - Chart configuration
 *
 * @internal
 */
export function syncAreaLayerToMap(
    map: IMapFacade,
    layerId: string,
    source: GeoJSONSourceSpecification,
    config: IGeoChartNextConfig,
): void {
    const ids = getAreaLayerIds(layerId);

    // Build plan using pre-computed source - no transformation needed
    const plan = createStylePlan()
        .addSource(ids.sourceId, source)
        // Add fill layer first (renders below outline)
        .addLayer(createAreaFillLayer(ids.sourceId, config, ids.fillLayerId))
        // Add outline layer on top of fill
        .addLayer(createAreaOutlineLayer(ids.sourceId, config, ids.outlineLayerId))
        .build();

    // applyStylePlan removes only resources in the plan, then re-adds them
    applyStylePlan(map, plan);
}

/**
 * Remove area layer and its resources from the map
 *
 * @param map - MapLibre map instance
 * @param layerId - Unique layer identifier
 *
 * @internal
 */
export function removeAreaLayer(map: IMapFacade, layerId: string): void {
    const ids = getAreaLayerIds(layerId);

    const layersToRemove = [ids.fillLayerId, ids.outlineLayerId];

    layersToRemove.forEach((id) => removeLayerIfExists(map, id));
    removeSourceIfExists(map, ids.sourceId);
}
