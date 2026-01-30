// (C) 2025-2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { DEFAULT_MAPLIBRE_OPTIONS, DEFAULT_TOOLTIP_OPTIONS } from "./mapConfig.js";
import type {
    LngLatBoundsLike,
    LngLatLike,
    Map as MapLibreMap,
    MapOptions,
    Popup,
} from "../../layers/common/mapFacade.js";
import { type IMapOptions } from "../../types/map/provider.js";
import { type IMapLibreLocale } from "../../utils/mapLocale.js";
import { fetchMapStyle } from "../style/styleEndpoint.js";

/**
 * Result of map initialization
 *
 * @internal
 */
export interface IMapInitResult {
    map: MapLibreMap;
    tooltip: Popup;
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
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
        maxZoom,
        style,
        tileset,
    }: IMapOptions,
    locale?: IMapLibreLocale,
    backend?: IAnalyticalBackend,
): Promise<IMapInitResult> {
    const maplibregl = await import("maplibre-gl");
    const styleSpecification = style ?? (backend ? await fetchMapStyle(backend, tileset) : undefined);

    if (!styleSpecification) {
        throw new Error("Map style is required. Provide either a style option or a backend instance.");
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

    if (maxZoom === null) {
        delete mapOptions.maxZoom;
    } else if (typeof maxZoom === "number") {
        mapOptions.maxZoom = maxZoom;
    }

    if (bounds) {
        const lngLatBounds: LngLatBoundsLike = [
            [bounds.southWest.lng, bounds.southWest.lat],
            [bounds.northEast.lng, bounds.northEast.lat],
        ];
        mapOptions.bounds = lngLatBounds;
    } else if (center) {
        const mapCenter: LngLatLike = [center.lng, center.lat];
        mapOptions.center = mapCenter;
    } else if (zoom) {
        mapOptions.zoom = zoom;
    }

    const map = new maplibregl.Map(mapOptions);
    const tooltip = new maplibregl.Popup(DEFAULT_TOOLTIP_OPTIONS);

    return new Promise<IMapInitResult>((resolve, reject) => {
        map.on("load", () => {
            resolve({ map, tooltip, maplibregl });
        });

        map.on("error", (event: IMapErrorEvent) => {
            console.error("[initializeMapLibreMap] Map error", event);
            reject(new Error(`MapLibre initialization error: ${getMaplibreErrorMessage(event)}`));
        });
    });
}

/**
 * MapLibre error event structure.
 */
interface IMapErrorEvent {
    error?: {
        message?: string;
    };
}

function getMaplibreErrorMessage(event: IMapErrorEvent): string {
    const message = event.error?.message;
    return typeof message === "string" && message.length > 0 ? message : "Unknown error";
}
