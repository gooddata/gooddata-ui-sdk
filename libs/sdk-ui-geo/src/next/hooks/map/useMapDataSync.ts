// (C) 2025 GoodData Corporation

import { useEffect, useMemo, useRef } from "react";

import type { Map as MapLibreMap } from "maplibre-gl";

import { DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { updateMapLayers } from "../../features/map/layerManagement.js";
import { applyViewportSafely, calculateViewport } from "../../features/map/viewportManagement.js";
import { IMapConfig } from "../../types/mapProvider.js";
import { IGeoData, IGeoLngLat } from "../../types/shared.js";

/**
 * Filter out invalid coordinates
 *
 * @remarks
 * Pure function that filters location data to only include valid coordinates.
 * Valid coordinates must be present and have finite lat/lng values.
 *
 * @param locations - Array of location coordinates (may include nulls/undefined)
 * @returns Filtered array of valid coordinates
 *
 * @internal
 */
export function getValidLocations(locations: Array<IGeoLngLat | null | undefined>): IGeoLngLat[] {
    return locations.filter(
        (coords): coords is IGeoLngLat =>
            coords !== null &&
            coords !== undefined &&
            Number.isFinite(coords.lat) &&
            Number.isFinite(coords.lng),
    );
}

/**
 * Check if viewport should be updated
 *
 * @remarks
 * Pure function that determines whether the viewport should be updated
 * based on configuration. The viewport is frozen when explicitly configured.
 *
 * @param config - Map configuration
 * @returns true if viewport should remain frozen, false if it should update
 *
 * @internal
 */
function isViewportFrozen(config: IMapConfig): boolean {
    return Boolean(config.viewport?.frozen);
}

/**
 * Synchronize geo data with map layers
 *
 * @remarks
 * This hook updates map layers when data, config, or color strategy changes.
 * It handles:
 * - Removing old layers
 * - Creating new data source
 * - Adding appropriate layers (clustered or unclustered)
 * - Setting viewport based on data (unless frozen or on first render)
 *
 * The hook waits for the map to be ready before attempting any updates.
 * On first render, viewport setting is skipped because it was already set
 * during map initialization.
 *
 * @param map - MapLibre map instance (null if not initialized)
 * @param geoData - Geographic data to display (null if not loaded)
 * @param config - Map configuration (null if not ready)
 * @param colorStrategy - Color strategy for styling (null if not ready)
 * @param isMapReady - Whether map is ready for updates
 * @param result - Execution result for data access
 *
 * @internal
 */
export function useMapDataSync(
    map: MapLibreMap | null,
    geoData: IGeoData | null,
    config: IMapConfig | null,
    colorStrategy: IColorStrategy | null,
    isMapReady: boolean,
    result: DataViewFacade | null,
): void {
    // Track first render to avoid re-applying viewport that was set during initialization
    const isFirstRenderRef = useRef(true);

    // Compute valid locations (pure function, memoized)
    const validLocations = useMemo(
        () => (geoData?.location?.data ? getValidLocations(geoData.location.data) : []),
        [geoData?.location?.data],
    );

    // Compute viewport (pure function, memoized)
    const viewport = useMemo(
        () => (config ? calculateViewport(validLocations, config) : null),
        [validLocations, config],
    );

    useEffect(() => {
        // Guard: ensure all dependencies are ready
        if (!map || !isMapReady || !geoData || !config || !colorStrategy || !result || !viewport) {
            return undefined;
        }

        // Update layers with new data
        updateMapLayers(map, geoData, config, colorStrategy);

        // Skip viewport update on first render (already set during initialization)
        // Update viewport on subsequent renders if not frozen
        if (!isFirstRenderRef.current && !isViewportFrozen(config)) {
            map.resize();
            return applyViewportSafely(map, viewport);
        }

        // Mark that first render has completed
        isFirstRenderRef.current = false;

        return undefined;
    }, [map, geoData, config, colorStrategy, result, isMapReady, viewport]);
}
