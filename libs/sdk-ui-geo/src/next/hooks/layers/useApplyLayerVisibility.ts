// (C) 2025-2026 GoodData Corporation

import { useEffect } from "react";

import { setLayerVisibility } from "../../layers/common/layerOps.js";
import type { IMapFacade } from "../../layers/common/mapFacade.js";
import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

/**
 * Applies layer visibility using MapLibre setLayoutProperty.
 *
 * @internal
 */
export function useApplyLayerVisibility({
    map,
    isMapReady,
    layerExecutions,
    hiddenLayers,
}: {
    map: IMapFacade | null;
    isMapReady: boolean;
    layerExecutions: ILayerExecutionRecord[];
    hiddenLayers: Set<string>;
}): void {
    useEffect(() => {
        if (!map || !isMapReady) {
            return;
        }

        for (const layerExecution of layerExecutions) {
            const { layerId, layer } = layerExecution;
            const adapter = getLayerAdapter(layer);
            if (!adapter) {
                continue;
            }

            const isVisible = !hiddenLayers.has(layerId);
            const mapLibreLayerIds = adapter.getMapLibreLayerIds(layer);
            for (const mapLibreLayerId of mapLibreLayerIds) {
                setLayerVisibility(map, mapLibreLayerId, isVisible);
            }
        }
    }, [map, isMapReady, layerExecutions, hiddenLayers]);
}
