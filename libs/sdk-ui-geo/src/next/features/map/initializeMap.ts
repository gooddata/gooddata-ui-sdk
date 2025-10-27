// (C) 2025 GoodData Corporation

import type { LngLatBoundsLike, LngLatLike, Map as MapLibreMap, MapOptions, Popup } from "maplibre-gl";

import {
    DEFAULT_MAPLIBRE_OPTIONS,
    DEFAULT_TOOLTIP_OPTIONS,
} from "../../providers/maplibre/maplibreConfig.js";
import { IMapOptions } from "../../types/mapProvider.js";
import { IMapLibreLocale } from "../../utils/mapLocale.js";

/**
 * Result of map initialization
 *
 * @internal
 */
export interface IMapInitResult {
    map: MapLibreMap;
    tooltip: Popup;
    maplibregl: typeof import("maplibre-gl");
}

/**
 * Initialize MapLibre GL map instance with options
 *
 * @remarks
 * This function handles the creation of a MapLibre GL map instance with all necessary
 * configuration. It dynamically imports maplibre-gl to avoid bundling issues, sets up
 * the map with safe default options, and ensures glyphs are properly configured for
 * text rendering.
 *
 * @param options - Map initialization options including container, center, zoom, bounds, etc.
 * @param locale - Optional MapLibre locale configuration for cooperative gestures
 * @returns Promise resolving to map instance, tooltip, and maplibre-gl module
 *
 * @internal
 */
export async function initializeMapLibreMap(
    {
        container,
        center,
        zoom,
        bounds,
        interactive = true,
        preserveDrawingBuffer = false,
        cooperativeGestures = true,
        style,
    }: IMapOptions,
    locale?: IMapLibreLocale,
): Promise<IMapInitResult> {
    // Dynamically import maplibre-gl to avoid bundling issues
    const maplibregl = await import("maplibre-gl");
    let styleSpecification = style;
    if (!styleSpecification) {
        const { createStyleSpecification } = await import("../../providers/maplibre/style.js");
        styleSpecification = createStyleSpecification(window.location.origin);
    }

    const mapOptions: MapOptions = {
        ...DEFAULT_MAPLIBRE_OPTIONS,
        style: styleSpecification,
        container,
        interactive,
        cooperativeGestures,
        preserveDrawingBuffer,
        ...(cooperativeGestures && locale ? { locale } : {}),
    };

    if (bounds) {
        mapOptions.bounds = [
            [bounds.southWest.lng, bounds.southWest.lat],
            [bounds.northEast.lng, bounds.northEast.lat],
        ] as LngLatBoundsLike;
    } else if (center) {
        mapOptions.center = [center.lng, center.lat] as LngLatLike;
    } else if (zoom) {
        mapOptions.zoom = zoom;
    }

    const map = new maplibregl.Map(mapOptions);
    const tooltip = new maplibregl.Popup(DEFAULT_TOOLTIP_OPTIONS);

    return new Promise<IMapInitResult>((resolve, reject) => {
        map.on("load", () => {
            resolve({ map, tooltip, maplibregl });
        });

        map.on("error", (e: unknown) => {
            console.error("[initializeMapLibreMap] Map error", e);
            reject(
                new Error(
                    `MapLibre initialization error: ${(e as { error?: { message?: string } })?.error?.message ?? "Unknown error"}`,
                ),
            );
        });
    });
}
