// (C) 2025 GoodData Corporation

import { getViewportOptions } from "./viewportPresets.js";
import type { IMapFacade, LngLatBoundsLike, LngLatLike } from "../../layers/common/mapFacade.js";
import { IGeoLngLat } from "../../types/common/coordinates.js";
import { IMapViewport, IPushpinMapConfig } from "../../types/map/provider.js";
import { isLngLatTupleBounds } from "../../utils/guards.js";
import { DEFAULT_BOUNDS_PADDING } from "../runtime/mapConfig.js";

/**
 * Convert GeoJSON bbox array to viewport bounds.
 *
 * @param bbox - Array in the form [minLng, minLat, maxLng, maxLat]
 * @returns Viewport containing bounds or null if invalid
 *
 * @alpha
 */
export function bboxToViewport(
    bbox?: readonly [number, number, number, number],
): Partial<IMapViewport> | null {
    if (!bbox || bbox.length < 4) {
        return null;
    }

    const [minLng, minLat, maxLng, maxLat] = bbox;

    if (![minLng, minLat, maxLng, maxLat].every((v) => Number.isFinite(v))) {
        return null;
    }

    return {
        bounds: {
            southWest: { lng: minLng, lat: minLat },
            northEast: { lng: maxLng, lat: maxLat },
        },
    };
}

/**
 * Calculate viewport for pushpin data points.
 *
 * @param locations - Array of location coordinates
 * @param config - Map configuration
 * @returns Viewport configuration with center/zoom or bounds
 *
 * @internal
 */
export function calculateViewport(locations: IGeoLngLat[], config: IPushpinMapConfig): Partial<IMapViewport> {
    const options = getViewportOptions(locations, config);

    if (options.bounds && isLngLatTupleBounds(options.bounds)) {
        const [sw, ne] = options.bounds;
        return {
            bounds: {
                southWest: { lng: sw[0], lat: sw[1] },
                northEast: { lng: ne[0], lat: ne[1] },
            },
        };
    }

    return {
        center: options.center,
        zoom: options.zoom,
    };
}

/**
 * Apply viewport to map instance using MapLibre's cameraForBounds.
 *
 * @param map - MapLibre map instance
 * @param viewport - Viewport configuration to apply
 * @param animate - Whether to animate the transition
 *
 * @internal
 */
export function applyViewport(
    map: IMapFacade,
    viewport: Partial<IMapViewport>,
    animate: boolean = true,
): void {
    if (viewport.bounds) {
        const southWest: [number, number] = [viewport.bounds.southWest.lng, viewport.bounds.southWest.lat];
        const northEast: [number, number] = [viewport.bounds.northEast.lng, viewport.bounds.northEast.lat];
        const bounds: LngLatBoundsLike = [southWest, northEast];

        const camera = map.cameraForBounds(bounds, { padding: DEFAULT_BOUNDS_PADDING });

        if (camera?.center && camera.zoom !== undefined) {
            if (animate) {
                map.flyTo({ center: camera.center, zoom: camera.zoom });
            } else {
                map.jumpTo({ center: camera.center, zoom: camera.zoom });
            }
        }
    } else if (viewport.center && viewport.zoom !== undefined) {
        const center: LngLatLike = [viewport.center.lng, viewport.center.lat];
        if (animate) {
            map.flyTo({ center, zoom: viewport.zoom });
        } else {
            map.jumpTo({ center, zoom: viewport.zoom });
        }
    } else if (viewport.center) {
        const center: LngLatLike = [viewport.center.lng, viewport.center.lat];
        map.panTo(center, { animate });
    } else if (viewport.zoom !== undefined) {
        map.zoomTo(viewport.zoom, { animate });
    }
}
