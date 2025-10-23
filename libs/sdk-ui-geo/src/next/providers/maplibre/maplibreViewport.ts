// (C) 2025 GoodData Corporation

import type { LngLatBoundsLike } from "maplibre-gl";

import { DEFAULT_CENTER, DEFAULT_WORLD_BOUNDS, DEFAULT_ZOOM, VIEWPORTS } from "./maplibreConfig.js";
import { IGeoConfigViewportNext, IGeoPushpinChartNextConfig } from "../../types/config.js";
import { IGeoLngLat, IGeoLngLatBounds } from "../../types/shared.js";

/**
 * Viewport configuration for MapLibre
 *
 * @alpha
 */
interface IGeoViewport {
    bounds?: LngLatBoundsLike;
    center?: IGeoLngLat;
    zoom?: number;
}

/**
 * Get viewport options based on data and configuration
 *
 * @param data - Array of location coordinates
 * @param config - Geo chart configuration
 * @returns Viewport configuration with bounds or center/zoom
 *
 * @alpha
 */
export function getViewportOptions(data: IGeoLngLat[], config: IGeoPushpinChartNextConfig): IGeoViewport {
    const center: IGeoLngLat | undefined = config?.center;
    const zoom: number = config?.zoom ?? DEFAULT_ZOOM;
    const { area }: IGeoConfigViewportNext = config?.viewport ?? {};

    // use `center` config if it exists
    if (!center) {
        if (area && VIEWPORTS[area]) {
            return {
                bounds: VIEWPORTS[area] as LngLatBoundsLike,
            };
        } else {
            const lngLatBounds: IGeoLngLatBounds | undefined = getLngLatBounds(data);
            if (lngLatBounds) {
                return {
                    bounds: [
                        [lngLatBounds.southWest.lng, lngLatBounds.southWest.lat],
                        [lngLatBounds.northEast.lng, lngLatBounds.northEast.lat],
                    ] as LngLatBoundsLike,
                };
            }

            return {
                center: DEFAULT_CENTER,
                zoom,
            };
        }
    }

    return {
        center,
        zoom,
    };
}

/**
 * Represents a rectangular geographical area on a map.
 *
 * @param lnglats - Array of coordinates
 * @returns Bounds containing all coordinates or undefined if empty
 *
 * @example
 * ```typescript
 * const corner1 = { lat: 40.712, lng: -74.227 };
 * const corner2 = { lat: 40.774, lng: -74.125 };
 * const bounds = getLngLatBounds([corner1, corner2]);
 *
 * if (bounds) {
 *     map.fitBounds([bounds.northEast, bounds.southWest], { padding: 60 });
 * }
 * ```
 *
 * @internal
 */
export function getLngLatBounds(lnglats: IGeoLngLat[]): IGeoLngLatBounds | undefined {
    if (!lnglats?.length) {
        return;
    }

    return lnglats.reduce(extendLngLatBounds, undefined) || DEFAULT_WORLD_BOUNDS;
}

// Extend the bounds to contain the given point
function extendLngLatBounds(bounds: IGeoLngLatBounds | undefined, lnglat: IGeoLngLat): IGeoLngLatBounds {
    if (!lnglat) {
        return bounds || DEFAULT_WORLD_BOUNDS;
    }

    if (!bounds) {
        return {
            northEast: lnglat,
            southWest: lnglat,
        };
    }

    const { northEast, southWest } = bounds;
    return {
        northEast: {
            lat: Math.max(lnglat.lat, northEast.lat),
            lng: Math.max(lnglat.lng, northEast.lng),
        },
        southWest: {
            lat: Math.min(lnglat.lat, southWest.lat),
            lng: Math.min(lnglat.lng, southWest.lng),
        },
    };
}
