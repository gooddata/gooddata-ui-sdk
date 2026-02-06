// (C) 2025-2026 GoodData Corporation

import { useEffect } from "react";

import type { IGeoLayerData } from "../../context/GeoLayersContext.js";
import type { EnabledItemsByLayer } from "../../context/GeoLegendContext.js";
import { setLayerFilter } from "../../layers/common/layerOps.js";
import type { FilterSpecification, IMapFacade } from "../../layers/common/mapFacade.js";
import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";
import { createSegmentFilter } from "../../map/style/sharedLayers.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

/**
 * Applies per-layer segment filters using MapLibre setFilter.
 *
 * @internal
 */
export function useApplyLayerSegmentFiltering({
    map,
    isMapReady,
    layerExecutions,
    layers,
    enabledItemsByLayer,
}: {
    map: IMapFacade | null;
    isMapReady: boolean;
    layerExecutions: ILayerExecutionRecord[];
    layers: Map<string, IGeoLayerData>;
    enabledItemsByLayer: EnabledItemsByLayer;
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

            // Only apply segment filter to layers with segment data (category legend).
            const layerData = layers.get(layerId);
            const hasCategoryLegend = layerData?.availableLegends?.hasCategoryLegend ?? false;

            const enabledItemsForLayer = enabledItemsByLayer.get(layerId);
            const selectedSegmentItems =
                enabledItemsForLayer === null || enabledItemsForLayer === undefined
                    ? []
                    : enabledItemsForLayer.length === 0
                      ? []
                      : enabledItemsForLayer;

            const filterableLayers = adapter.getFilterableLayers?.(layer) ?? [];

            for (const { layerId: mapLibreLayerId, baseFilter } of filterableLayers) {
                let filter: FilterSpecification | undefined;

                if (selectedSegmentItems.length > 0 && hasCategoryLegend) {
                    const segmentFilter = createSegmentFilter(selectedSegmentItems);
                    filter = baseFilter
                        ? (["all", baseFilter, segmentFilter] as FilterSpecification)
                        : segmentFilter;
                } else {
                    filter = baseFilter;
                }

                setLayerFilter(map, mapLibreLayerId, filter);
            }
        }
    }, [map, isMapReady, layerExecutions, layers, enabledItemsByLayer]);
}
