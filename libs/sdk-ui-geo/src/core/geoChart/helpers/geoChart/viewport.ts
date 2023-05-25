// (C) 2020-2022 GoodData Corporation
import mapboxgl from "mapbox-gl";

import { DEFAULT_CENTER, DEFAULT_ZOOM, VIEWPORTS, DEFAULT_WORLD_BOUNDS } from "../../constants/geoChart.js";
import { IGeoConfig, IGeoConfigViewport, IGeoLngLat, IGeoLngLatBounds } from "../../../../GeoChart.js";

interface IGeoViewport {
    bounds?: mapboxgl.LngLatBoundsLike;
    center?: IGeoLngLat;
    zoom?: number;
}

export function getViewportOptions(data: IGeoLngLat[], config: IGeoConfig): IGeoViewport {
    const center: IGeoLngLat | undefined = config?.center;
    const zoom: number = config?.zoom ?? DEFAULT_ZOOM;
    const { area }: IGeoConfigViewport = config?.viewport ?? {};

    // use `center` config if it exists
    if (!center) {
        if (area && VIEWPORTS[area]) {
            return {
                bounds: VIEWPORTS[area],
            };
        } else {
            const lngLatBounds: IGeoLngLatBounds | undefined = getLngLatBounds(data);
            if (lngLatBounds) {
                return {
                    bounds: [lngLatBounds.northEast, lngLatBounds.southWest],
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

/*
 * @method getLngLatBounds: IGeoLngLatBounds
 * Represents a rectangular geographical area on a map.
 *
 * @example
 *
 * ```js
 * const corner1 = [40.712, -74.227],
 * const corner2 = [40.774, -74.125],
 * const bounds = getLngLatBounds([corner1, corner2]);
 *
 * bounds && map.fitBounds([bounds.northEast, bounds.southWest], { padding: 60 });
 * ```
 */
export function getLngLatBounds(lnglats: IGeoLngLat[]): IGeoLngLatBounds | undefined {
    if (!lnglats?.length) {
        return;
    }

    return lnglats.reduce(extendLngLatBounds, undefined) || DEFAULT_WORLD_BOUNDS;
}

// @method extendLngLatBounds: IGeoLngLatBounds
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
