// (C) 2025-2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import {
    DEFAULT_MAPLIBRE_OPTIONS,
    DEFAULT_TOOLTIP_OPTIONS,
    type IMapInteractionOptions,
    resolveMapInteractionOptions,
} from "./mapConfig.js";
import type {
    LngLatBoundsLike,
    LngLatLike,
    Map as MapLibreMap,
    MapOptions,
    Popup,
} from "../../layers/common/mapFacade.js";
import { type IGeoChartViewportNavigation } from "../../types/config/viewport.js";
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
    // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
    maplibregl: typeof import("maplibre-gl");
}

interface IMapInitializationOptions extends IMapOptions {
    dragRotate?: IMapInteractionOptions["dragRotate"];
    pitchWithRotate?: IMapInteractionOptions["pitchWithRotate"];
    touchZoomRotate?: IMapInteractionOptions["touchZoomRotate"];
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
        dragRotate,
        pitchWithRotate,
        touchZoomRotate,
        navigation,
        enableGeoChartsViewportConfig = false,
        preserveDrawingBuffer = false,
        cooperativeGestures = true,
        maxZoom,
        style,
        tileset,
    }: IMapInitializationOptions,
    locale?: IMapLibreLocale,
    backend?: IAnalyticalBackend,
): Promise<IMapInitResult> {
    const maplibregl = await import("maplibre-gl");
    const styleSpecification = style ?? (backend ? await fetchMapStyle(backend, tileset) : undefined);

    if (!styleSpecification) {
        throw new Error("Map style is required. Provide either a style option or a backend instance.");
    }

    const interactionOptions = resolveMapInteractionOptions({
        interactive,
        dragRotate,
        pitchWithRotate,
        touchZoomRotate,
    });

    const mapOptions: MapOptions = {
        ...DEFAULT_MAPLIBRE_OPTIONS,
        ...interactionOptions,
        style: styleSpecification,
        container,
        ...getNavigationOptions(navigation, interactionOptions),
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
        if (enableGeoChartsViewportConfig && typeof zoom === "number") {
            mapOptions.zoom = zoom;
        }
    } else if (typeof zoom === "number") {
        mapOptions.zoom = zoom;
    }

    const map = new maplibregl.Map(mapOptions);
    if (
        navigation !== undefined &&
        interactionOptions.interactive &&
        (navigation?.zoom ?? true) &&
        mapOptions.touchZoomRotate !== false
    ) {
        map.touchZoomRotate.disableRotation();
    }
    const tooltip = new maplibregl.Popup(DEFAULT_TOOLTIP_OPTIONS);

    return new Promise<IMapInitResult>((resolve, reject) => {
        let isSettled = false;
        const finalizeResolve = () => {
            if (isSettled) {
                return;
            }
            isSettled = true;
            cleanup();
            resolve({ map, tooltip, maplibregl });
        };
        const finalizeReject = (event: IMapErrorEvent) => {
            if (isSettled) {
                return;
            }
            isSettled = true;
            cleanup();
            console.error("[initializeMapLibreMap] Map error", event);
            reject(new Error(`MapLibre initialization error: ${getMaplibreErrorMessage(event)}`));
        };
        const tryResolveFromCurrentState = () => {
            if (!isSettled && map.loaded() && map.isStyleLoaded()) {
                finalizeResolve();
            }
        };
        const onLoad = () => tryResolveFromCurrentState();
        const onStyleData = () => tryResolveFromCurrentState();
        const onError = (event: IMapErrorEvent) => {
            finalizeReject(event);
        };
        const cleanup = () => {
            map.off("load", onLoad);
            map.off("styledata", onStyleData);
            map.off("error", onError);
        };

        map.on("load", onLoad);
        map.on("styledata", onStyleData);
        map.on("error", onError);
        tryResolveFromCurrentState();
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

function getNavigationOptions(
    navigation: IGeoChartViewportNavigation | undefined,
    interactionOptions: IMapInteractionOptions,
): Partial<MapOptions> {
    if (!interactionOptions.interactive) {
        return {};
    }

    const isPanEnabled = navigation?.pan ?? true;
    const isZoomEnabled = navigation?.zoom ?? true;
    const navigationOptions: Partial<MapOptions> = {};

    // Keep native MapLibre defaults when enabled; override only disabled capabilities.
    if (!isPanEnabled) {
        navigationOptions.dragPan = false;
    }

    if (!isZoomEnabled) {
        navigationOptions.scrollZoom = false;
        navigationOptions.doubleClickZoom = false;
        navigationOptions.boxZoom = false;
        navigationOptions.touchZoomRotate = false;
    } else if (interactionOptions.touchZoomRotate !== false) {
        // Preserve explicit touch override when provided (defaults remain untouched otherwise).
        navigationOptions.touchZoomRotate = interactionOptions.touchZoomRotate;
    }

    // Keyboard controls include both pan and zoom, so disable them when either is turned off.
    if (!isPanEnabled || !isZoomEnabled) {
        navigationOptions.keyboard = false;
    }

    return navigationOptions;
}

function getMaplibreErrorMessage(event: IMapErrorEvent): string {
    const message = event.error?.message;
    return typeof message === "string" && message.length > 0 ? message : "Unknown error";
}
