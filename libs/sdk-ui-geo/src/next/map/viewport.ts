// (C) 2025 GoodData Corporation

import { IGeoLayerData } from "../context/GeoLayersContext.js";
import { IMapViewport } from "../types/map/provider.js";

function mergeBounds(
    a: IMapViewport["bounds"] | undefined,
    b: IMapViewport["bounds"] | undefined,
): IMapViewport["bounds"] | undefined {
    if (!a) {
        return b;
    }
    if (!b) {
        return a;
    }
    return {
        southWest: {
            lng: Math.min(a.southWest.lng, b.southWest.lng),
            lat: Math.min(a.southWest.lat, b.southWest.lat),
        },
        northEast: {
            lng: Math.max(a.northEast.lng, b.northEast.lng),
            lat: Math.max(a.northEast.lat, b.northEast.lat),
        },
    };
}

/**
 * Computes a combined viewport from all layers.
 * Merges bounds from all layers to ensure all data is visible.
 */
export function computeCombinedViewport(layers: Map<string, IGeoLayerData>): Partial<IMapViewport> | null {
    let combinedBounds: IMapViewport["bounds"] | undefined;
    let fallbackViewport: Partial<IMapViewport> | null = null;

    for (const layerData of layers.values()) {
        const viewport = layerData.initialViewport;
        if (!viewport) {
            continue;
        }

        if (!fallbackViewport) {
            fallbackViewport = viewport;
        }

        if (viewport.bounds) {
            combinedBounds = mergeBounds(combinedBounds, viewport.bounds);
        }
    }

    if (combinedBounds) {
        return { bounds: combinedBounds };
    }

    return fallbackViewport;
}
