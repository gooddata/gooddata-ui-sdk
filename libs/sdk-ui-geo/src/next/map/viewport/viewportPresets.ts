// (C) 2025-2026 GoodData Corporation

import type { LngLatBoundsLike } from "../../layers/common/mapFacade.js";
import { type IGeoLngLat, type IGeoLngLatBounds } from "../../types/common/coordinates.js";
import { type IGeoPushpinChartConfig } from "../../types/config/pushpinChart.js";
import { type IGeoChartViewport } from "../../types/config/viewport.js";
import { DEFAULT_CENTER, DEFAULT_WORLD_BOUNDS, DEFAULT_ZOOM, VIEWPORTS } from "../runtime/mapConfig.js";

/**
 * Viewport configuration for MapLibre
 *
 * @internal
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
 * @internal
 */
export function getViewportOptions(data: IGeoLngLat[], config: IGeoPushpinChartConfig): IGeoViewport {
    const center: IGeoLngLat | undefined = config?.center;
    const zoom: number = config?.zoom ?? DEFAULT_ZOOM;
    const { area }: IGeoChartViewport = config?.viewport ?? {};

    if (!center) {
        if (area && area !== "auto") {
            const [southWest, northEast] = VIEWPORTS[area];
            const bounds: LngLatBoundsLike = [southWest, northEast];
            return { bounds };
        } else {
            const lngLatBounds: IGeoLngLatBounds | undefined = getLngLatBounds(data);
            if (lngLatBounds) {
                const bounds: LngLatBoundsLike = [
                    [lngLatBounds.southWest.lng, lngLatBounds.southWest.lat],
                    [lngLatBounds.northEast.lng, lngLatBounds.northEast.lat],
                ];
                return { bounds };
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
