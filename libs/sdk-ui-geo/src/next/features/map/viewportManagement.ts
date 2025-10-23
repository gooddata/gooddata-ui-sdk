// (C) 2025 GoodData Corporation

import type { LngLat, LngLatBoundsLike, LngLatLike, Map as MapLibreMap } from "maplibre-gl";

import { getViewportOptions } from "../../providers/maplibre/maplibreViewport.js";
import { IMapConfig, IMapViewport } from "../../types/mapProvider.js";
import { IGeoLngLat } from "../../types/shared.js";

type LngLatInput = LngLatLike | LngLat;

function toTuple(lngLat: LngLatInput): [number, number] {
    if (Array.isArray(lngLat)) {
        const [lng = 0, lat = 0] = lngLat as number[];
        return [lng, lat];
    }

    if (typeof lngLat === "object" && lngLat) {
        const candidate = lngLat as Record<"lng" | "lat" | "lon", number | (() => number)>;

        const lng =
            typeof candidate.lng === "function" ? candidate.lng() : (candidate.lng ?? candidate.lon ?? 0);
        const lat = typeof candidate.lat === "function" ? candidate.lat() : (candidate.lat ?? 0);
        return [lng, lat];
    }

    return [0, 0];
}

function normalizeBounds(bounds: LngLatBoundsLike | undefined): IMapViewport["bounds"] | undefined {
    if (!bounds) {
        return undefined;
    }

    if (
        typeof (bounds as { getSouthWest?: () => LngLat; getNorthEast?: () => LngLat }).getSouthWest ===
        "function"
    ) {
        const sw = (bounds as { getSouthWest: () => LngLat }).getSouthWest();
        const ne = (bounds as { getNorthEast: () => LngLat }).getNorthEast();
        const [swLng, swLat] = toTuple(sw);
        const [neLng, neLat] = toTuple(ne);

        return {
            southWest: { lng: Math.min(swLng, neLng), lat: Math.min(swLat, neLat) },
            northEast: { lng: Math.max(swLng, neLng), lat: Math.max(swLat, neLat) },
        };
    }

    if (Array.isArray(bounds)) {
        const [first, second] = bounds as LngLatInput[];
        if (!first || !second) {
            return undefined;
        }
        const [lng1, lat1] = toTuple(first);
        const [lng2, lat2] = toTuple(second);

        return {
            southWest: { lng: Math.min(lng1, lng2), lat: Math.min(lat1, lat2) },
            northEast: { lng: Math.max(lng1, lng2), lat: Math.max(lat1, lat2) },
        };
    }

    return undefined;
}

/**
 * Calculate optimal viewport for data points
 *
 * @remarks
 * This function determines the best viewport (center/zoom or bounds) based on
 * the provided location data and configuration. It considers:
 * - Explicit center/zoom from config
 * - Viewport area presets (continents, world, etc.)
 * - Calculated bounds from data points
 * - Default fallback values
 *
 * @param locations - Array of location coordinates
 * @param config - Map configuration
 * @returns Viewport configuration with center/zoom or bounds
 *
 * @internal
 */
export function calculateViewport(locations: IGeoLngLat[], config: IMapConfig): Partial<IMapViewport> {
    const viewportOptions = getViewportOptions(locations, config);

    return {
        center: viewportOptions.center,
        zoom: viewportOptions.zoom,
        bounds: normalizeBounds(viewportOptions.bounds),
    };
}

/**
 * Apply viewport to map instance
 *
 * @remarks
 * This function applies a viewport configuration to the map. It can:
 * - Fit the map to bounds with padding
 * - Set center and zoom together
 * - Pan to a new center
 * - Zoom to a specific level
 *
 * The animate parameter controls whether transitions are animated.
 *
 * @param map - MapLibre map instance
 * @param viewport - Viewport configuration to apply
 * @param animate - Whether to animate the transition
 *
 * @internal
 */
export function applyViewport(
    map: MapLibreMap,
    viewport: Partial<IMapViewport>,
    animate: boolean = true,
): void {
    const options = { animate };

    if (viewport.bounds) {
        const bounds: [[number, number], [number, number]] = [
            [viewport.bounds.southWest.lng, viewport.bounds.southWest.lat],
            [viewport.bounds.northEast.lng, viewport.bounds.northEast.lat],
        ];
        map.fitBounds(bounds, { ...options, padding: 45 });
    } else if (viewport.center && viewport.zoom !== undefined) {
        map.flyTo({
            center: [viewport.center.lng, viewport.center.lat] as LngLatLike,
            zoom: viewport.zoom,
            ...options,
        });
    } else if (viewport.center) {
        map.panTo([viewport.center.lng, viewport.center.lat] as LngLatLike, options);
    } else if (viewport.zoom !== undefined) {
        map.zoomTo(viewport.zoom, options);
    }
}

/**
 * Apply viewport with manual center/zoom calculation for bounds
 *
 * @remarks
 * This is a specialized version that manually calculates center and zoom
 * from bounds to avoid fitBounds wrapping issues with continental-scale data.
 * Used primarily during initial map setup.
 *
 * @param map - MapLibre map instance
 * @param viewport - Viewport configuration to apply
 *
 * @internal
 */
export function applyViewportWithManualCalculation(map: MapLibreMap, viewport: Partial<IMapViewport>): void {
    if (viewport.bounds) {
        // Calculate center manually to avoid fitBounds wrapping issues
        const { southWest, northEast } = viewport.bounds;
        const centerLng = (southWest.lng + northEast.lng) / 2;
        const centerLat = (southWest.lat + northEast.lat) / 2;
        const zoom = 3; // Conservative zoom for continental-scale data
        map.setCenter([centerLng, centerLat] as LngLatLike);
        map.setZoom(zoom);
    } else if (viewport.center && viewport.zoom !== undefined) {
        map.setCenter([viewport.center.lng, viewport.center.lat] as LngLatLike);
        map.setZoom(viewport.zoom);
    }
}

/**
 * Apply viewport with graceful error handling
 *
 * @remarks
 * This function applies a viewport with automatic fallback strategies:
 * 1. Try standard applyViewport (respects animations and constraints)
 * 2. If that fails and we're still loading, retry once on "idle"
 * 3. If still failing, use manual calculation as last resort
 *
 * This handles edge cases like:
 * - Map not fully loaded yet
 * - Invalid bounds that cause fitBounds to throw
 * - Continental-scale data that causes wrapping issues
 *
 * @param map - MapLibre map instance
 * @param viewport - Viewport configuration to apply
 * @returns Cleanup function to remove event listeners
 *
 * @internal
 */
export function applyViewportSafely(
    map: MapLibreMap,
    viewport: Partial<IMapViewport>,
): (() => void) | undefined {
    try {
        // Try standard application first
        applyViewport(map, viewport, false);
        return undefined;
    } catch {
        // Only retry if we have bounds (most common failure case)
        if (!viewport.bounds) {
            applyViewportWithManualCalculation(map, viewport);
            return undefined;
        }

        // Create retry handler
        const retryOnce = () => {
            try {
                applyViewport(map, viewport, false);
            } catch {
                // Final fallback: manual calculation
                applyViewportWithManualCalculation(map, viewport);
            }
        };

        // If map is loaded, retry immediately
        if (map.loaded()) {
            retryOnce();
            return undefined;
        }

        // Otherwise, wait for map to be idle
        void map.once("idle", retryOnce);
        return () => {
            map.off("idle", retryOnce);
        };
    }
}
