// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useRef } from "react";

import { type IHeaderPredicate } from "@gooddata/sdk-ui";

import { useLayerTooltips } from "./useLayerTooltips.js";
import { type IGeoLayerData, useGeoLayers } from "../../context/GeoLayersContext.js";
import { useMapRuntime } from "../../context/MapRuntimeContext.js";
import type { IMapFacade } from "../../layers/common/mapFacade.js";
import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";
import type { IGeoAdapterContext } from "../../layers/registry/adapterTypes.js";
import { buildOutputFromLayerData } from "../../layers/registry/output.js";
import { type ILayerExecutionRecord } from "../../types/props/geoChartNext/internal.js";

interface IUseLayerSyncParams {
    /**
     * Drillable predicates for tooltip interactions.
     */
    drillablePredicates: IHeaderPredicate[];
}

/**
 * Syncs a single layer to the map.
 */
function syncLayerToMap(
    layerExecution: ILayerExecutionRecord,
    layerData: IGeoLayerData,
    map: IMapFacade,
    adapterContext: IGeoAdapterContext,
): () => void {
    const { layer } = layerExecution;
    const adapter = getLayerAdapter(layer);
    const layerOutput = buildOutputFromLayerData(layerData);

    if (!adapter || !layerOutput) {
        return () => {};
    }

    adapter.syncToMap(layer, map, layerOutput, adapterContext);

    return () => {
        adapter.removeFromMap(layer, map);
    };
}

/**
 * Hook that syncs all pre-loaded layer data to the map.
 *
 * @remarks
 * This hook replaces the LayerRenderer component. It handles:
 * - Syncing prepared output for all layers to the MapLibre map
 * - Cleanup on unmount or when dependencies change
 *
 * Tooltip registration is delegated to useLayerTooltips hook.
 * All data is pre-loaded before this hook runs - no async operations here.
 *
 * @internal
 */
export function useSyncLayersToMap({ drillablePredicates }: IUseLayerSyncParams): void {
    const { map, isMapReady, tooltip, adapterContext } = useMapRuntime();
    const { layers, layerExecutions } = useGeoLayers();

    const layerCleanupsRef = useRef<Map<string, () => void>>(new Map());

    const cleanupLayers = useCallback(() => {
        layerCleanupsRef.current.forEach((cleanup) => cleanup());
        layerCleanupsRef.current.clear();
    }, []);

    useEffect(() => {
        if (!map || !isMapReady) {
            cleanupLayers();
            return;
        }

        cleanupLayers();

        for (const layerExecution of layerExecutions) {
            const layerData = layers.get(layerExecution.layerId);
            if (!layerData) {
                continue;
            }

            const layerCleanup = syncLayerToMap(layerExecution, layerData, map, adapterContext);
            layerCleanupsRef.current.set(layerExecution.layerId, layerCleanup);
        }

        return cleanupLayers;
    }, [map, isMapReady, layerExecutions, layers, adapterContext, cleanupLayers]);

    useLayerTooltips({
        map,
        isMapReady,
        tooltip,
        drillablePredicates,
        layerExecutions,
        layers,
        adapterContext,
    });
}
