// (C) 2025-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useEffect, useMemo, useRef } from "react";

import { DefaultColorPalette, usePrevious } from "@gooddata/sdk-ui";

import type { IGeoLayerData } from "../../context/GeoLayersContext.js";
import type { IMapFacade } from "../../layers/common/mapFacade.js";
import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";
import type { IGeoAdapterContext } from "../../layers/registry/adapterTypes.js";
import { buildOutputFromLayerData } from "../../layers/registry/output.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

function areSameOrder(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

interface ILayerMapState {
    cleanup: () => void;
    mapSyncKey: string;
    layerData: IGeoLayerData;
}

function getLayerOrder(layerExecutions: ILayerExecutionRecord[]): string[] {
    return layerExecutions.map(({ layerId }) => layerId);
}

function getAdapterMapSyncKey(
    layerExecution: ILayerExecutionRecord,
    adapterContext: IGeoAdapterContext,
): string {
    const adapter = getLayerAdapter(layerExecution.layer);
    return adapter?.getMapSyncKey?.(layerExecution.layer, adapterContext) ?? "";
}

function shouldReinitLayer(
    prev: ILayerMapState | undefined,
    nextMapSyncKey: string,
    nextLayerData: IGeoLayerData,
): boolean {
    if (!prev) {
        return true;
    }

    if (prev.mapSyncKey !== nextMapSyncKey) {
        return true;
    }

    // GeoLayersProvider may recreate IGeoLayerData wrapper objects frequently.
    // Trigger re-init only when the prepared inputs change, not when the wrapper identity changes.
    if (prev.layerData.source !== nextLayerData.source) {
        return true;
    }
    if (prev.layerData.dataView !== nextLayerData.dataView) {
        return true;
    }

    return false;
}

function pruneRemovedLayers(
    mapState: Map<string, ILayerMapState>,
    nextLayerIds: Set<string>,
    layers: Map<string, IGeoLayerData>,
): void {
    for (const [layerId, { cleanup }] of mapState) {
        if (!nextLayerIds.has(layerId) || !layers.get(layerId)) {
            cleanup();
            mapState.delete(layerId);
        }
    }
}

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

    const perLayerContext: IGeoAdapterContext = {
        ...adapterContext,
        colorPalette: layer.config?.colorPalette ?? DefaultColorPalette,
        colorMapping: layer.config?.colorMapping ?? [],
    };

    adapter.syncToMap(layer, map, layerOutput, layerData.dataView, perLayerContext);

    return () => {
        adapter.removeFromMap(layer, map);
    };
}

/**
 * Sync layers to the map using adapter "re-init" semantics.
 *
 * @remarks
 * This hook owns "remove+add" lifecycle and keeps it per-layer when possible:
 * - Re-inits a layer if its adapter `getMapSyncKey()` changes or prepared `layerData` identity changes
 * - Falls back to full re-sync when layer order changes (z-order safety)
 *
 * @internal
 */
export function useInitLayersToMap({
    map,
    isMapReady,
    layerExecutions,
    layers,
    mapSyncKey,
    adapterContextRef,
}: {
    map: IMapFacade | null;
    isMapReady: boolean;
    layerExecutions: ILayerExecutionRecord[];
    layers: Map<string, IGeoLayerData>;
    mapSyncKey: string;
    adapterContextRef: MutableRefObject<IGeoAdapterContext>;
}): void {
    const layerMapStateRef = useRef<Map<string, ILayerMapState>>(new Map());
    const layerOrder = useMemo(
        () => (map && isMapReady ? getLayerOrder(layerExecutions) : []),
        [map, isMapReady, layerExecutions],
    );
    const prevLayerOrder = usePrevious(layerOrder);
    const prevMap = usePrevious(map);

    const cleanupLayers = useCallback((): void => {
        layerMapStateRef.current.forEach(({ cleanup }) => cleanup());
        layerMapStateRef.current.clear();
    }, []);

    // Ensure we always remove layers on unmount.
    useEffect(() => cleanupLayers, [cleanupLayers]);

    useEffect(() => {
        if (!map || !isMapReady) {
            cleanupLayers();
            return;
        }

        // `mapSyncKey` is intentionally not used directly here. It exists to trigger this effect
        // when adapter context changes require a layer re-init (see `useSyncLayersToMap`).
        const adapterContext = adapterContextRef.current;

        const hasStableOrder = prevLayerOrder.length === 0 || areSameOrder(prevLayerOrder, layerOrder);
        const mapInstanceChanged = prevMap !== map;

        // Full re-sync triggers:
        // - map instance change: previous layers belong to a different map
        // - layer order change: MapLibre adds layers "on top"; partial re-add cannot guarantee z-order
        const needsFullResync = mapInstanceChanged || !hasStableOrder;

        const initAllLayers = (): void => {
            for (const layerExecution of layerExecutions) {
                const { layerId } = layerExecution;
                const layerData = layers.get(layerId);
                if (!layerData) {
                    continue;
                }

                const cleanup = syncLayerToMap(layerExecution, layerData, map, adapterContext);
                const nextKey = getAdapterMapSyncKey(layerExecution, adapterContext);
                layerMapStateRef.current.set(layerId, {
                    cleanup,
                    mapSyncKey: nextKey,
                    layerData,
                });
            }
        };

        const reinitChangedLayers = (): void => {
            const mapState = layerMapStateRef.current;
            const nextLayerIds = new Set(layerOrder);

            pruneRemovedLayers(mapState, nextLayerIds, layers);

            for (const layerExecution of layerExecutions) {
                const { layerId } = layerExecution;
                const layerData = layers.get(layerId);
                if (!layerData) {
                    continue;
                }

                const prev = mapState.get(layerId);
                const nextKey = getAdapterMapSyncKey(layerExecution, adapterContext);
                if (!shouldReinitLayer(prev, nextKey, layerData)) {
                    continue;
                }

                prev?.cleanup();

                const cleanup = syncLayerToMap(layerExecution, layerData, map, adapterContext);
                mapState.set(layerId, { cleanup, mapSyncKey: nextKey, layerData });
            }
        };

        if (needsFullResync) {
            cleanupLayers();
            initAllLayers();
            return;
        }
        reinitChangedLayers();
    }, [
        map,
        isMapReady,
        layerExecutions,
        layers,
        cleanupLayers,
        mapSyncKey,
        adapterContextRef,
        layerOrder,
        prevLayerOrder,
        prevMap,
    ]);
}
