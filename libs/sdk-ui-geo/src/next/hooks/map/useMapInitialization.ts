// (C) 2025-2026 GoodData Corporation

import { type RefObject, useEffect, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type GoodDataSdkError, convertError, resolveLocale } from "@gooddata/sdk-ui";

import {
    type IMapFacade,
    type IPopupFacade,
    type Map,
    type Popup,
    createMapFacade,
    createPopupFacade,
} from "../../layers/common/mapFacade.js";
import { resolveMapInteractionOptions } from "../../map/runtime/mapConfig.js";
import { initializeMapLibreMap } from "../../map/runtime/mapInitialization.js";
import { type IGeoChartConfig } from "../../types/config/unified.js";
import { type IMapViewport } from "../../types/map/provider.js";
import { getMapCanvasRuntimeCapabilities } from "../../utils/mapCanvasAccessibility.js";
import { generateMapLibreLocale } from "../../utils/mapLocale.js";

/**
 * Hook return value
 *
 * @internal
 */
export interface IUseMapInitializationResult {
    /**
     * Map facade instance (null until initialized)
     */
    map: IMapFacade | null;

    /**
     * Tooltip popup instance (null until initialized)
     */
    tooltip: IPopupFacade | null;

    /**
     * Whether map is ready for use
     */
    isMapReady: boolean;

    /**
     * Error that occurred during initialization
     */
    error: GoodDataSdkError | null;
}

interface INavigationConfig {
    applyViewportNavigation: boolean;
    pan: boolean;
    zoom: boolean;
}

const ZOOM_IN_KEYS = new Set(["=", "+", "Add"]);
const ZOOM_OUT_KEYS = new Set(["-", "_", "Subtract"]);
const PAN_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

function isKeyboardZoomKey(event: KeyboardEvent): boolean {
    return ZOOM_IN_KEYS.has(event.key) || ZOOM_OUT_KEYS.has(event.key);
}

function isKeyboardPanKey(event: KeyboardEvent): boolean {
    // Shift + arrows is used by MapLibre for rotation/pitch, not pan.
    return !event.shiftKey && PAN_KEYS.has(event.key);
}

function resolveInitialNavigationConfig(
    applyViewportNavigation: boolean | undefined,
    pan: boolean | undefined,
    zoom: boolean | undefined,
): INavigationConfig {
    const shouldApplyViewportNavigation = applyViewportNavigation ?? true;

    return {
        applyViewportNavigation: shouldApplyViewportNavigation,
        pan: shouldApplyViewportNavigation ? (pan ?? true) : true,
        zoom: shouldApplyViewportNavigation ? (zoom ?? true) : true,
    };
}

function normalizeGeoBasemapOption(basemap: string | undefined): string | undefined {
    if (basemap === undefined || basemap === "default") {
        return undefined;
    }
    return basemap;
}

/**
 * Cleanup map resources
 *
 * @remarks
 * Pure function that safely removes map and tooltip instances.
 * Handles null checks internally for clean code.
 *
 * @param map - MapLibre map instance to remove (or null)
 * @param tooltip - Tooltip popup instance to remove (or null)
 *
 * @internal
 */
function cleanupMapResources(map: Map | null, tooltip: Popup | null): void {
    tooltip?.remove();
    map?.remove();
}

const MAP_FOCUSABLE_SELECTOR = "a, button, summary, [tabindex]";

function ensureLegendBeforeMapCanvas(
    container: HTMLDivElement,
    canvasContainer: HTMLElement | null,
    legend: HTMLDivElement | null | undefined,
): void {
    // Keep legend controls before the map canvas in tab order.
    if (
        legend &&
        canvasContainer &&
        legend.parentElement === container &&
        canvasContainer.parentElement === container &&
        legend.nextElementSibling !== canvasContainer
    ) {
        container.insertBefore(legend, canvasContainer);
    }
}

function disableNonLegendTabStops(
    container: HTMLDivElement,
    canvas: HTMLCanvasElement,
    legend: HTMLDivElement | null | undefined,
): void {
    // Only legend controls and canvas should be in widget tab sequence.
    const focusables = container.querySelectorAll<HTMLElement>(MAP_FOCUSABLE_SELECTOR);
    focusables.forEach((element) => {
        if (element === canvas) {
            return;
        }

        if (legend?.contains(element)) {
            return;
        }

        if (element.tabIndex !== -1) {
            element.tabIndex = -1;
        }
    });
}

function normalizeMapCanvasA11yDom(
    container: HTMLDivElement,
    map: Map,
    legend: HTMLDivElement | null | undefined,
): void {
    const canvas = map.getCanvas();
    const canvasContainer = map.getCanvasContainer?.() ?? canvas.parentElement;

    ensureLegendBeforeMapCanvas(container, canvasContainer, legend);
    disableNonLegendTabStops(container, canvas, legend);
}

interface IMapA11ySetupParams {
    container: HTMLDivElement;
    map: Map;
    mapInstanceRef: RefObject<Map | null>;
    legendPanelRef?: RefObject<HTMLDivElement | null>;
    mapCanvasTitle?: string;
    mapInstructionsId?: string;
    intl: ReturnType<typeof useIntl>;
    isKeyboardInteractionEnabled: boolean;
    isKeyboardRotationEnabled: boolean;
    isKeyboardPanEnabled: boolean;
    isKeyboardZoomEnabled: boolean;
    isMountedRef: { current: boolean };
}

interface IMapA11ySetupResult {
    handleFocus: (() => void) | null;
    handleBlur: (() => void) | null;
    handleKeyDown: ((event: KeyboardEvent) => void) | null;
    observer: MutationObserver | null;
    setObserverActive: (active: boolean) => void;
}

function setupMapA11y(params: IMapA11ySetupParams): IMapA11ySetupResult {
    const {
        container,
        map,
        mapInstanceRef,
        legendPanelRef,
        mapCanvasTitle,
        mapInstructionsId,
        intl,
        isKeyboardInteractionEnabled,
        isKeyboardRotationEnabled,
        isKeyboardPanEnabled,
        isKeyboardZoomEnabled,
        isMountedRef,
    } = params;

    const canvas = map.getCanvas();
    canvas.tabIndex = 0;
    const label = mapCanvasTitle
        ? intl.formatMessage({ id: "geochart.map.canvas.label" }, { title: mapCanvasTitle })
        : intl.formatMessage({ id: "geochart.map.canvas.label.fallback" });
    canvas.setAttribute("aria-label", label);
    if (mapInstructionsId) {
        canvas.setAttribute("aria-describedby", mapInstructionsId);
    }

    normalizeMapCanvasA11yDom(container, map, legendPanelRef?.current ?? null);

    let isDomA11yObserverActive = false;
    let observer: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined") {
        observer = new MutationObserver(() => {
            if (!isMountedRef.current || !isDomA11yObserverActive || mapInstanceRef.current !== map) {
                return;
            }
            normalizeMapCanvasA11yDom(container, map, legendPanelRef?.current ?? null);
        });
        isDomA11yObserverActive = true;
        observer.observe(container, { childList: true, subtree: true });
    }

    map.keyboard.disable();

    const handleFocus = () => {
        if (isKeyboardInteractionEnabled) {
            map.keyboard.enable();
            if (!isKeyboardRotationEnabled) {
                map.keyboard.disableRotation();
            }
        }
    };
    const handleBlur = () => {
        map.keyboard.disable();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        const shouldBlockPan = !isKeyboardPanEnabled && isKeyboardPanKey(event);
        const shouldBlockZoom = !isKeyboardZoomEnabled && isKeyboardZoomKey(event);
        if (!shouldBlockPan && !shouldBlockZoom) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    };

    canvas.addEventListener("focus", handleFocus);
    canvas.addEventListener("blur", handleBlur);
    canvas.addEventListener("keydown", handleKeyDown, true);

    return {
        handleFocus,
        handleBlur,
        handleKeyDown,
        observer,
        setObserverActive: (active: boolean) => {
            isDomA11yObserverActive = active;
        },
    };
}

function cleanupMapA11y(canvas: HTMLCanvasElement | undefined, a11ySetup: IMapA11ySetupResult | null): void {
    if (canvas && a11ySetup) {
        if (a11ySetup.handleFocus) {
            canvas.removeEventListener("focus", a11ySetup.handleFocus);
        }
        if (a11ySetup.handleBlur) {
            canvas.removeEventListener("blur", a11ySetup.handleBlur);
        }
        if (a11ySetup.handleKeyDown) {
            canvas.removeEventListener("keydown", a11ySetup.handleKeyDown, true);
        }
    }
    a11ySetup?.setObserverActive(false);
    a11ySetup?.observer?.takeRecords();
    a11ySetup?.observer?.disconnect();
}

function captureCurrentViewport(map: Map): Partial<IMapViewport> {
    const center = map.getCenter();

    return {
        center: {
            lng: center.lng,
            lat: center.lat,
        },
        zoom: map.getZoom(),
    };
}

function getRequestedViewport(
    initialViewportBounds:
        | {
              southWest: { lng: number; lat: number };
              northEast: { lng: number; lat: number };
          }
        | undefined,
    initialViewportCenter: { lng: number; lat: number } | undefined,
    initialViewportZoom: number | undefined,
    configCenter: { lng: number; lat: number } | undefined,
    configZoom: IGeoChartConfig["zoom"] | undefined,
): Partial<IMapViewport> {
    return {
        center: initialViewportCenter ?? configCenter,
        zoom: initialViewportZoom ?? configZoom,
        bounds: initialViewportBounds,
    };
}

function getViewportKey(viewport: Partial<IMapViewport>): string {
    if (viewport.bounds) {
        const { southWest, northEast } = viewport.bounds;
        return `bounds:${southWest.lng}:${southWest.lat}:${northEast.lng}:${northEast.lat}`;
    }

    if (viewport.center && viewport.zoom !== undefined) {
        return `center:${viewport.center.lng}:${viewport.center.lat}:zoom:${viewport.zoom}`;
    }

    if (viewport.center) {
        return `center:${viewport.center.lng}:${viewport.center.lat}`;
    }

    if (viewport.zoom !== undefined) {
        return `zoom:${viewport.zoom}`;
    }

    return "empty";
}

/**
 * Initialize map instance
 *
 * @remarks
 * This hook handles map creation, loading state, and cleanup.
 * It creates the MapLibre map instance when the container is ready
 * and cleans it up on unmount.
 *
 * The map instance is returned along with loading/error states.
 *
 * Key behaviors:
 * - Accepts pre-calculated viewport to prevent initial world view
 * - Captures initial center/zoom on first render (prevents re-centering on config changes)
 * - Creates map instance asynchronously
 * - Handles race conditions with isMounted flag
 * - Cleans up resources on unmount or style change
 * - Supports cooperative gestures with localized messages
 *
 * @param containerRef - Ref to the map container element
 * @param config - Geo configuration (optional)
 * @param initialViewport - Pre-calculated viewport from data (optional)
 * @param backend - Backend used to resolve map style when not provided inline (optional)
 * @param locale - Locale string used to derive the map label language (optional)
 * @param mapInstructionsId - ID of screen-reader-only map instructions element (optional)
 * @param mapCanvasTitle - Optional title used for map canvas accessible name
 * @param legendPanelRef - Optional ref to legend root element rendered by React
 * @returns Map instance, tooltip, ready state, and error
 *
 * @internal
 */
export function useMapInitialization(
    containerRef: RefObject<HTMLDivElement | null>,
    config?: IGeoChartConfig,
    initialViewport?: Partial<IMapViewport> | null,
    backend?: IAnalyticalBackend,
    locale?: string,
    mapInstructionsId?: string,
    mapCanvasTitle?: string,
    legendPanelRef?: RefObject<HTMLDivElement | null>,
): IUseMapInitializationResult {
    const intl = useIntl();
    const [map, setMap] = useState<IMapFacade | null>(null);
    const [tooltip, setTooltip] = useState<IPopupFacade | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [error, setError] = useState<GoodDataSdkError | null>(null);
    const isViewportConfigEnabled = config?.enableGeoChartsViewportConfig ?? true;
    const applyViewportNavigation = config?.applyViewportNavigation;
    const shouldApplyViewportNavigation = applyViewportNavigation ?? true;
    const panNavigation = shouldApplyViewportNavigation ? config?.viewport?.navigation?.pan : undefined;
    const zoomNavigation = shouldApplyViewportNavigation ? config?.viewport?.navigation?.zoom : undefined;

    const mapInstanceRef = useRef<Map | null>(null);
    const tooltipInstanceRef = useRef<Popup | null>(null);
    const initialViewportBoundsSouthWestLng = initialViewport?.bounds?.southWest.lng;
    const initialViewportBoundsSouthWestLat = initialViewport?.bounds?.southWest.lat;
    const initialViewportBoundsNorthEastLng = initialViewport?.bounds?.northEast.lng;
    const initialViewportBoundsNorthEastLat = initialViewport?.bounds?.northEast.lat;
    const initialViewportCenterLng = initialViewport?.center?.lng;
    const initialViewportCenterLat = initialViewport?.center?.lat;
    const initialViewportZoom = initialViewport?.zoom;
    const configCenterLng = config?.center?.lng;
    const configCenterLat = config?.center?.lat;
    const configZoom = config?.zoom;
    const initialBoundsPadding = config?.viewport?.area === "custom" && config?.bounds ? 0 : undefined;

    const requestedViewport = useMemo(
        () =>
            getRequestedViewport(
                initialViewportBoundsSouthWestLng !== undefined &&
                    initialViewportBoundsSouthWestLat !== undefined &&
                    initialViewportBoundsNorthEastLng !== undefined &&
                    initialViewportBoundsNorthEastLat !== undefined
                    ? {
                          southWest: {
                              lng: initialViewportBoundsSouthWestLng,
                              lat: initialViewportBoundsSouthWestLat,
                          },
                          northEast: {
                              lng: initialViewportBoundsNorthEastLng,
                              lat: initialViewportBoundsNorthEastLat,
                          },
                      }
                    : undefined,
                initialViewportCenterLng !== undefined && initialViewportCenterLat !== undefined
                    ? {
                          lng: initialViewportCenterLng,
                          lat: initialViewportCenterLat,
                      }
                    : undefined,
                initialViewportZoom,
                configCenterLng !== undefined && configCenterLat !== undefined
                    ? {
                          lng: configCenterLng,
                          lat: configCenterLat,
                      }
                    : undefined,
                configZoom,
            ),
        [
            initialViewportBoundsSouthWestLng,
            initialViewportBoundsSouthWestLat,
            initialViewportBoundsNorthEastLng,
            initialViewportBoundsNorthEastLat,
            initialViewportCenterLng,
            initialViewportCenterLat,
            initialViewportZoom,
            configCenterLng,
            configCenterLat,
            configZoom,
        ],
    );
    const requestedViewportKey = useMemo(() => getViewportKey(requestedViewport), [requestedViewport]);
    const initialViewportRef = useRef<Partial<IMapViewport>>(requestedViewport);
    const requestedViewportKeyRef = useRef(requestedViewportKey);
    const navigationConfig = useMemo(
        () => resolveInitialNavigationConfig(applyViewportNavigation, panNavigation, zoomNavigation),
        [applyViewportNavigation, panNavigation, zoomNavigation],
    );

    useEffect(() => {
        if (requestedViewportKeyRef.current === requestedViewportKey) {
            return;
        }

        requestedViewportKeyRef.current = requestedViewportKey;

        if (!mapInstanceRef.current) {
            initialViewportRef.current = requestedViewport;
        }
    }, [requestedViewport, requestedViewportKey]);

    const cooperativeGestures = config?.cooperativeGestures ?? true;
    const mapLibreLocale = useMemo(() => {
        return cooperativeGestures ? generateMapLibreLocale(intl) : undefined;
    }, [cooperativeGestures, intl]);

    const mapLanguage = useMemo(() => {
        if (typeof locale !== "string" || locale.trim().length === 0) {
            return undefined;
        }

        const resolvedLocale = resolveLocale(locale);
        return resolvedLocale.split("-")[0].toLowerCase();
    }, [locale]);

    const isExportMode = config?.isExportMode ?? false;
    const isViewportFrozen = Boolean(config?.viewport?.frozen);
    const interactionOptions = useMemo(
        () => resolveMapInteractionOptions({ interactive: !isViewportFrozen }),
        [isViewportFrozen],
    );
    const maxZoom = config?.maxZoomLevel;
    const rawBasemap = config?.basemap === undefined ? undefined : `${config.basemap}`;
    const basemap = normalizeGeoBasemapOption(rawBasemap);
    const isGeoChartA11yImprovementsEnabled = config?.enableGeoChartA11yImprovements ?? false;
    const { isKeyboardInteractionEnabled, isKeyboardRotationEnabled } = useMemo(
        () =>
            getMapCanvasRuntimeCapabilities(
                {
                    viewport: {
                        frozen: isViewportFrozen,
                    },
                },
                interactionOptions,
            ),
        [isViewportFrozen, interactionOptions],
    );
    const isKeyboardPanEnabled = !navigationConfig.applyViewportNavigation || navigationConfig.pan;
    const isKeyboardZoomEnabled = !navigationConfig.applyViewportNavigation || navigationConfig.zoom;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const isMountedRef = { current: true };
        let a11ySetup: IMapA11ySetupResult | null = null;
        setError(null);

        initializeMapLibreMap(
            {
                container,
                bounds: initialViewportRef.current.bounds,
                boundsPadding: initialBoundsPadding,
                center: initialViewportRef.current.center,
                zoom: initialViewportRef.current.zoom,
                cooperativeGestures,
                interactive: interactionOptions.interactive,
                enableGeoChartsViewportConfig: isViewportConfigEnabled,
                navigation: navigationConfig.applyViewportNavigation
                    ? {
                          pan: navigationConfig.pan,
                          zoom: navigationConfig.zoom,
                      }
                    : undefined,
                preserveDrawingBuffer: isExportMode,
                maxZoom,
                style: config?.mapStyle,
                basemap,
                language: mapLanguage,
            },
            mapLibreLocale,
            backend,
        )
            .then((result) => {
                if (isMountedRef.current) {
                    mapInstanceRef.current = result.map;
                    tooltipInstanceRef.current = result.tooltip;

                    if (isGeoChartA11yImprovementsEnabled) {
                        a11ySetup = setupMapA11y({
                            container,
                            map: result.map,
                            mapInstanceRef,
                            legendPanelRef,
                            mapCanvasTitle,
                            mapInstructionsId,
                            intl,
                            isKeyboardInteractionEnabled,
                            isKeyboardRotationEnabled,
                            isKeyboardPanEnabled,
                            isKeyboardZoomEnabled,
                            isMountedRef,
                        });
                    }

                    setMap(createMapFacade(result.map));
                    setTooltip(createPopupFacade(result.tooltip));
                    setIsMapReady(true);
                } else {
                    cleanupMapResources(result.map, result.tooltip);
                }
            })
            .catch((err) => {
                if (isMountedRef.current) {
                    console.error("[useMapInitialization] Failed to initialize map:", err);
                    setError(convertError(err));
                }
            });

        return () => {
            isMountedRef.current = false;
            setIsMapReady(false);

            if (mapInstanceRef.current) {
                initialViewportRef.current = captureCurrentViewport(mapInstanceRef.current);
            }

            cleanupMapA11y(mapInstanceRef.current?.getCanvas(), a11ySetup);

            cleanupMapResources(mapInstanceRef.current, tooltipInstanceRef.current);
            mapInstanceRef.current = null;
            tooltipInstanceRef.current = null;
        };
    }, [
        containerRef,
        config?.mapStyle,
        cooperativeGestures,
        interactionOptions,
        isViewportConfigEnabled,
        navigationConfig,
        isExportMode,
        isGeoChartA11yImprovementsEnabled,
        isKeyboardInteractionEnabled,
        isKeyboardPanEnabled,
        isKeyboardZoomEnabled,
        isKeyboardRotationEnabled,
        mapLibreLocale,
        backend,
        maxZoom,
        initialBoundsPadding,
        basemap,
        mapLanguage,
        intl,
        mapInstructionsId,
        mapCanvasTitle,
        legendPanelRef,
    ]);

    return { map, tooltip, isMapReady, error };
}
