// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef } from "react";

import type { IHeaderPredicate, OnFiredDrillEvent } from "@gooddata/sdk-ui";

import { useLayerClickEvent } from "./useLayerClickEvent.js";
import { useLayerTooltips } from "./useLayerTooltips.js";
import { type IGeoLayerData, useGeoLayers } from "../../context/GeoLayersContext.js";
import { useGeoLegend } from "../../context/GeoLegendContext.js";
import { useMapRuntime } from "../../context/MapRuntimeContext.js";
import { setLayerFilter, setLayerVisibility } from "../../layers/common/layerOps.js";
import type { FilterSpecification, IMapFacade } from "../../layers/common/mapFacade.js";
import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";
import type { IGeoAdapterContext } from "../../layers/registry/adapterTypes.js";
import { buildOutputFromLayerData } from "../../layers/registry/output.js";
import { createSegmentFilter } from "../../map/style/sharedLayers.js";
import { type ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

interface IUseLayerSyncParams {
    /**
     * Drillable predicates for tooltip interactions.
     */
    drillablePredicates: IHeaderPredicate[];

    /**
     * Callback fired when user triggers a drill.
     */
    onDrill?: OnFiredDrillEvent;

    /**
     * Enables positioning of drill menu at the cursor click point (instead of default positioning).
     */
    enableDrillMenuPositioningAtCursor?: boolean;
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
 * - Toggling layer visibility based on legend toggle state (without removing/re-adding layers)
 *
 * Tooltip registration is delegated to useLayerTooltips hook.
 * All data is pre-loaded before this hook runs - no async operations here.
 *
 * @internal
 */
export function useSyncLayersToMap({
    drillablePredicates,
    onDrill,
    enableDrillMenuPositioningAtCursor = false,
}: IUseLayerSyncParams): void {
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

    const layerCleanupsRef = useRef<Map<string, () => void>>(new Map());

    // Use ref for adapterContext in Effect 1 to avoid re-syncing layers when context updates
    // (filter changes are handled separately by Effect 3).
    const adapterContextRef = useRef(adapterContext);
    adapterContextRef.current = adapterContext;

    const cleanupLayers = useCallback(() => {
        layerCleanupsRef.current.forEach((cleanup) => cleanup());
        layerCleanupsRef.current.clear();
    }, []);

    // Effect 1: Sync all layers to the map (independent of filter/visibility state)
    // This runs only when layer data changes, not on filter or visibility toggle
    // Uses ref for adapterContext so filter changes don't cause layer re-sync
    useEffect(() => {
        if (!map || !isMapReady) {
            cleanupLayers();
            return;
        }

        cleanupLayers();

        for (const layerExecution of layerExecutions) {
            const { layerId } = layerExecution;
            const layerData = layers.get(layerId);

            if (!layerData) {
                continue;
            }

            const layerCleanup = syncLayerToMap(layerExecution, layerData, map, adapterContextRef.current);
            layerCleanupsRef.current.set(layerId, layerCleanup);
        }

        return cleanupLayers;
    }, [map, isMapReady, layerExecutions, layers, cleanupLayers, mapSyncKey]);

    // Effect 2: Toggle layer visibility using MapLibre's setLayoutProperty
    // This is much smoother than removing/re-adding layers
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

    // Effect 3: Update segment filters using MapLibre's setFilter
    // This updates filters without removing/re-adding layers
    // Only applies to layers that have category legend (segment data)
    // Filters are applied per-layer based on enabledItemsByLayer
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

            // Check if this layer has category legend (segment data)
            // Only apply segment filter to layers with segment data
            const layerData = layers.get(layerId);
            const hasCategoryLegend = layerData?.availableLegends?.hasCategoryLegend ?? false;

            // Get per-layer enabled items
            // If layer is not in the map, all items are enabled (null = no filter)
            // If layer has empty array, all items are disabled (show nothing - but we treat as show all)
            const enabledItemsForLayer = enabledItemsByLayer.get(layerId);

            // Compute selected segment items for this layer
            // null or undefined means all items enabled - no filter needed
            // empty array means all disabled - we treat as "reset" (show all)
            // otherwise, filter to only the enabled URIs
            const selectedSegmentItems =
                enabledItemsForLayer === null || enabledItemsForLayer === undefined
                    ? []
                    : enabledItemsForLayer.length === 0
                      ? []
                      : enabledItemsForLayer;

            // Get filterable layers with their base filters
            const filterableLayers = adapter.getFilterableLayers?.(layer) ?? [];

            for (const { layerId: mapLibreLayerId, baseFilter } of filterableLayers) {
                let filter: FilterSpecification | undefined;

                // Only apply segment filter if:
                // 1. There are selected segment items to filter by
                // 2. This layer actually has segment data (category legend)
                if (selectedSegmentItems.length > 0 && hasCategoryLegend) {
                    const segmentFilter = createSegmentFilter(selectedSegmentItems);
                    // Combine with base filter if present
                    if (baseFilter) {
                        filter = ["all", baseFilter, segmentFilter] as FilterSpecification;
                    } else {
                        filter = segmentFilter;
                    }
                } else {
                    // No segment filter - use base filter only (or clear if no base)
                    filter = baseFilter;
                }

                setLayerFilter(map, mapLibreLayerId, filter);
            }
        }
    }, [map, isMapReady, layerExecutions, layers, enabledItemsByLayer]);

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

    useLayerClickEvent(
        map,
        isMapReady,
        layers,
        drillablePredicates,
        enableDrillMenuPositioningAtCursor,
        onDrill,
    );
}
