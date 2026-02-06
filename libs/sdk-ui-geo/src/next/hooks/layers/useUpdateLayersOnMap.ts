// (C) 2025-2026 GoodData Corporation

import { type MutableRefObject, useEffect, useRef } from "react";

import { DefaultColorPalette } from "@gooddata/sdk-ui";

import type { IGeoLayerData } from "../../context/GeoLayersContext.js";
import type { IMapFacade } from "../../layers/common/mapFacade.js";
import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";
import type { IGeoAdapterContext } from "../../layers/registry/adapterTypes.js";
import { buildOutputFromLayerData } from "../../layers/registry/output.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

/**
 * Updates layers on the map (in-place) when the adapter-declared update key changes.
 *
 * @remarks
 * This is the "no flicker" path: it should avoid remove+add. Structural changes are handled by
 * `useInitLayersToMap` via `getMapSyncKey`.
 *
 * @internal
 */
export function useUpdateLayersOnMap({
    map,
    isMapReady,
    layerExecutions,
    layers,
    adapterContextRef,
}: {
    map: IMapFacade | null;
    isMapReady: boolean;
    layerExecutions: ILayerExecutionRecord[];
    layers: Map<string, IGeoLayerData>;
    adapterContextRef: MutableRefObject<IGeoAdapterContext>;
}): void {
    const prevLayerUpdateKeyRef = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        if (!map || !isMapReady) {
            return;
        }

        const nextLayerIds = new Set(layerExecutions.map((e) => e.layerId));
        for (const existingId of prevLayerUpdateKeyRef.current.keys()) {
            if (!nextLayerIds.has(existingId)) {
                prevLayerUpdateKeyRef.current.delete(existingId);
            }
        }

        for (const layerExecution of layerExecutions) {
            const { layerId, layer } = layerExecution;
            const layerData = layers.get(layerId);
            if (!layerData) {
                continue;
            }

            const adapter = getLayerAdapter(layer);
            const layerOutput = buildOutputFromLayerData(layerData);
            if (!adapter || !layerOutput) {
                continue;
            }

            const perLayerContext: IGeoAdapterContext = {
                ...adapterContextRef.current,
                colorPalette: layer.config?.colorPalette ?? DefaultColorPalette,
                colorMapping: layer.config?.colorMapping ?? [],
            };

            const nextUpdateKey = adapter.getMapUpdateKey?.(layer, perLayerContext) ?? "";
            const prevUpdateKey = prevLayerUpdateKeyRef.current.get(layerId);

            // Initial mount: the init hook already applied output. Just initialize cache.
            if (prevUpdateKey === undefined) {
                prevLayerUpdateKeyRef.current.set(layerId, nextUpdateKey);
                continue;
            }

            if (prevUpdateKey === nextUpdateKey) {
                continue;
            }

            // Clear lifecycle split:
            // - init/remove+add is handled by `useInitLayersToMap`
            // - this hook only performs in-place updates
            adapter.updateOnMap?.(layer, map, layerOutput, layerData.dataView, perLayerContext);
            prevLayerUpdateKeyRef.current.set(layerId, nextUpdateKey);
        }
    }, [map, isMapReady, layerExecutions, layers, adapterContextRef]);
}
