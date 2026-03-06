// (C) 2026 GoodData Corporation

import type { LngLatBoundsLike } from "../../layers/common/mapFacade.js";
import type { IGeoLngLatBounds } from "../../types/common/coordinates.js";

/**
 * Normalizes explicit dateline-crossing bounds to an increasing longitude interval.
 *
 * @remarks
 * Bounds produced as min/max envelopes are preserved to avoid excluding intermediate longitudes.
 *
 * @internal
 */
export function normalizeBoundsForShortestPath(bounds: IGeoLngLatBounds): LngLatBoundsLike {
    const south: [number, number] = [bounds.southWest.lng, bounds.southWest.lat];
    const north: [number, number] = [bounds.northEast.lng, bounds.northEast.lat];

    const west = south[0];
    let east = north[0];

    // Normalize explicit dateline-crossing input (e.g. west=170, east=-170) to positive span.
    if (east < west) {
        east += 360;
    }

    return [
        [west, south[1]],
        [east, north[1]],
    ];
}
