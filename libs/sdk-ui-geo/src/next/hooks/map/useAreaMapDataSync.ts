// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

import type { Map as MapLibreMap } from "maplibre-gl";

import { DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { updateAreaMapLayers } from "../../features/map/areaLayerManagement.js";
import { applyViewportSafely } from "../../features/map/viewportManagement.js";
import { IGeoAreaChartConfig } from "../../types/areaConfig.js";
import { IMapViewport } from "../../types/mapProvider.js";
import { IAreaGeoData } from "../../types/shared.js";
import { IAreaCollectionFeatures } from "../shared/useAreaCollectionFeatures.js";

/**
 * Synchronize area geo data with map layers
 *
 * @remarks
 * This hook updates map layers when area data, config, or color strategy changes.
 * It handles:
 * - Removing old layers
 * - Creating new data source
 * - Adding fill and outline layers
 *
 * The hook waits for the map to be ready before attempting any updates and
 * reapplies viewport bounds from geo collection metadata when available.
 *
 * @param map - MapLibre map instance (null if not initialized)
 * @param geoData - Area geographic data to display (null if not loaded)
 * @param config - Map configuration (null if not ready)
 * @param colorStrategy - Color strategy for styling (null if not ready)
 * @param isMapReady - Whether map is ready for updates
 * @param result - Execution result for data access
 *
 * @internal
 */
function isViewportFrozen(config: IGeoAreaChartConfig): boolean {
    return Boolean(config.viewport?.frozen);
}

export function useAreaMapDataSync(
    map: MapLibreMap | null,
    geoData: IAreaGeoData | null,
    config: IGeoAreaChartConfig | null,
    colorStrategy: IColorStrategy | null,
    isMapReady: boolean,
    result: DataViewFacade | null,
    collection: IAreaCollectionFeatures,
    viewport: Partial<IMapViewport> | null,
): void {
    // Track first render
    const isFirstRenderRef = useRef(true);

    useEffect(() => {
        if (collection.status === "error" && collection.error) {
            console.warn(
                "[GeoAreaChart] Failed to load geo collection items for area rendering.",
                collection.error,
            );
        }
    }, [collection.status, collection.error]);

    useEffect(() => {
        // Guard: ensure all dependencies are ready
        if (!map || !isMapReady || !geoData || !config || !colorStrategy || !result) {
            return undefined;
        }

        if (collection.metadata && collection.status === "loading") {
            return undefined;
        }

        // Update layers with new area data
        updateAreaMapLayers(map, geoData, config, colorStrategy, {
            features: collection.status === "success" ? collection.features : undefined,
        });

        let cleanup: (() => void) | undefined;

        if (!isFirstRenderRef.current && viewport && !isViewportFrozen(config)) {
            map.resize();
            cleanup = applyViewportSafely(map, viewport);
        }

        // Mark that first render has completed
        isFirstRenderRef.current = false;

        return cleanup;
    }, [
        map,
        geoData,
        config,
        colorStrategy,
        result,
        isMapReady,
        collection.status,
        collection.features,
        collection.metadata,
        viewport,
    ]);
}
