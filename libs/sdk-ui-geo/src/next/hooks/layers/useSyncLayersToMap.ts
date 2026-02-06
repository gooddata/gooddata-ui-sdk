// (C) 2025-2026 GoodData Corporation

import { useMemo, useRef } from "react";

import { type IHeaderPredicate, type OnFiredDrillEvent } from "@gooddata/sdk-ui";

import { useApplyLayerSegmentFiltering } from "./useApplyLayerSegmentFiltering.js";
import { useApplyLayerVisibility } from "./useApplyLayerVisibility.js";
import { useInitLayersToMap } from "./useInitLayersToMap.js";
import { useLayerClickEvent } from "./useLayerClickEvent.js";
import { useLayerTooltips } from "./useLayerTooltips.js";
import { useUpdateLayersOnMap } from "./useUpdateLayersOnMap.js";
import { useGeoLayers } from "../../context/GeoLayersContext.js";
import { useGeoLegend } from "../../context/GeoLegendContext.js";
import { useMapRuntime } from "../../context/MapRuntimeContext.js";
import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";

interface IUseLayerSyncParams {
    /**
     * Drillable predicates for tooltip interactions.
     */
    drillablePredicates: IHeaderPredicate[];

    /**
     * Callback fired when user triggers a drill.
     */
    onDrill?: OnFiredDrillEvent;
}

/**
 * Hook that syncs all pre-loaded layer data to the map.
 *
 * @remarks
 * This hook replaces the LayerRenderer component. It handles:
 * - Syncing prepared output for all layers to the MapLibre map
 * - Cleanup on unmount or when dependencies change
 * - Toggling layer visibility based on legend toggle state (without removing/re-adding layers)
 *
 * Tooltip registration is delegated to useLayerTooltips hook.
 * All data is pre-loaded before this hook runs - no async operations here.
 *
 * @internal
 */
export function useSyncLayersToMap({ drillablePredicates, onDrill }: IUseLayerSyncParams): void {
    const { map, isMapReady, tooltip, adapterContext } = useMapRuntime();
    const { layers, layerExecutions } = useGeoLayers();
    const { hiddenLayers, enabledItemsByLayer } = useGeoLegend();
    // Key capturing adapter-declared config changes that require a full re-sync.
    // Keeps this hook generic (no layer-specific config knowledge).
    const mapSyncKey = useMemo(() => {
        return layerExecutions
            .map(({ layerId, layer }) => {
                const adapter = getLayerAdapter(layer);
                const key = adapter.getMapSyncKey?.(layer, adapterContext) ?? "";
                return `${layerId}:${key}`;
            })
            .join("|");
    }, [layerExecutions, adapterContext]);

    // Use ref for adapterContext in Effect 1 to avoid re-syncing layers when context updates
    // (filter changes are handled separately by Effect 3).
    const adapterContextRef = useRef(adapterContext);
    adapterContextRef.current = adapterContext;

    useInitLayersToMap({
        map,
        isMapReady,
        layerExecutions,
        layers,
        mapSyncKey,
        adapterContextRef,
    });

    useUpdateLayersOnMap({ map, isMapReady, layerExecutions, layers, adapterContextRef });

    useApplyLayerVisibility({ map, isMapReady, layerExecutions, hiddenLayers });

    useApplyLayerSegmentFiltering({ map, isMapReady, layerExecutions, layers, enabledItemsByLayer });

    // Filter layer executions for tooltips to exclude hidden layers
    const visibleLayerExecutions = useMemo(
        () => layerExecutions.filter((execution) => !hiddenLayers.has(execution.layerId)),
        [layerExecutions, hiddenLayers],
    );

    useLayerTooltips({
        map,
        isMapReady,
        tooltip,
        drillablePredicates,
        layerExecutions: visibleLayerExecutions,
        layers,
        adapterContext,
    });

    useLayerClickEvent(map, isMapReady, layers, drillablePredicates, onDrill);
}
