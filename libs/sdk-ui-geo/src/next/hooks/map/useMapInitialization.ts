// (C) 2025-2026 GoodData Corporation

import { type RefObject, useEffect, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

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
import type { GeoTileset } from "../../types/map/tileset.js";
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
    error: Error | null;
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
    mapInstructionsId?: string,
    mapCanvasTitle?: string,
    legendPanelRef?: RefObject<HTMLDivElement | null>,
): IUseMapInitializationResult {
    const intl = useIntl();
    const [map, setMap] = useState<IMapFacade | null>(null);
    const [tooltip, setTooltip] = useState<IPopupFacade | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const mapInstanceRef = useRef<Map | null>(null);
    const tooltipInstanceRef = useRef<Popup | null>(null);

    const initialViewportRef = useRef<Partial<IMapViewport>>({
        center: initialViewport?.center ?? config?.center,
        zoom: initialViewport?.zoom ?? config?.zoom,
        bounds: initialViewport?.bounds,
    });

    useEffect(() => {
        if (!mapInstanceRef.current) {
            initialViewportRef.current = {
                center: initialViewport?.center ?? config?.center,
                zoom: initialViewport?.zoom ?? config?.zoom,
                bounds: initialViewport?.bounds,
            };
        }
    }, [config?.center, config?.zoom, initialViewport]);

    const cooperativeGestures = config?.cooperativeGestures ?? true;
    const locale = useMemo(() => {
        return cooperativeGestures ? generateMapLibreLocale(intl) : undefined;
    }, [cooperativeGestures, intl]);

    const isExportMode = config?.isExportMode ?? false;
    const isViewportFrozen = Boolean(config?.viewport?.frozen);
    const interactionOptions = useMemo(
        () => resolveMapInteractionOptions({ interactive: !isViewportFrozen }),
        [isViewportFrozen],
    );
    const maxZoom = config?.maxZoomLevel;
    const tileset: GeoTileset = config?.tileset ?? "default";
    const isGeoChartA11yImprovementsEnabled = config?.enableGeoChartA11yImprovements ?? false;
    const { isKeyboardInteractionEnabled, isKeyboardRotationEnabled } = useMemo(
        () => getMapCanvasRuntimeCapabilities(config, interactionOptions),
        [config, interactionOptions],
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        let isMounted = true;
        let handleFocus: (() => void) | null = null;
        let handleBlur: (() => void) | null = null;
        let domA11yObserver: MutationObserver | null = null;
        let isDomA11yObserverActive = false;

        initializeMapLibreMap(
            {
                container,
                bounds: initialViewportRef.current.bounds,
                center: initialViewportRef.current.center,
                zoom: initialViewportRef.current.zoom,
                cooperativeGestures,
                interactive: interactionOptions.interactive,
                preserveDrawingBuffer: isExportMode,
                maxZoom,
                style: config?.mapStyle,
                tileset,
            },
            locale,
            backend,
        )
            .then((result) => {
                if (isMounted) {
                    mapInstanceRef.current = result.map;
                    tooltipInstanceRef.current = result.tooltip;

                    if (isGeoChartA11yImprovementsEnabled) {
                        const canvas = result.map.getCanvas();
                        canvas.tabIndex = 0;
                        const label = mapCanvasTitle
                            ? intl.formatMessage(
                                  { id: "geochart.map.canvas.label" },
                                  { title: mapCanvasTitle },
                              )
                            : intl.formatMessage({ id: "geochart.map.canvas.label.fallback" });
                        canvas.setAttribute("aria-label", label);
                        if (mapInstructionsId) {
                            canvas.setAttribute("aria-describedby", mapInstructionsId);
                        }

                        normalizeMapCanvasA11yDom(container, result.map, legendPanelRef?.current ?? null);
                        if (typeof MutationObserver !== "undefined") {
                            domA11yObserver = new MutationObserver(() => {
                                if (
                                    !isMounted ||
                                    !isDomA11yObserverActive ||
                                    mapInstanceRef.current !== result.map
                                ) {
                                    return;
                                }
                                normalizeMapCanvasA11yDom(
                                    container,
                                    result.map,
                                    legendPanelRef?.current ?? null,
                                );
                            });
                            isDomA11yObserverActive = true;
                            domA11yObserver.observe(container, { childList: true, subtree: true });
                        }

                        result.map.keyboard.disable();

                        handleFocus = () => {
                            if (isKeyboardInteractionEnabled) {
                                result.map.keyboard.enable();
                                if (!isKeyboardRotationEnabled) {
                                    result.map.keyboard.disableRotation();
                                }
                            }
                        };
                        handleBlur = () => {
                            result.map.keyboard.disable();
                        };
                        canvas.addEventListener("focus", handleFocus);
                        canvas.addEventListener("blur", handleBlur);
                    }

                    setMap(createMapFacade(result.map));
                    setTooltip(createPopupFacade(result.tooltip));
                    setIsMapReady(true);
                } else {
                    cleanupMapResources(result.map, result.tooltip);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error("[useMapInitialization] Failed to initialize map:", err);
                    setError(err);
                }
            });

        return () => {
            isMounted = false;
            setIsMapReady(false);

            // Clean up a11y focus/blur listeners
            const canvas = mapInstanceRef.current?.getCanvas();
            if (canvas) {
                if (handleFocus) {
                    canvas.removeEventListener("focus", handleFocus);
                }
                if (handleBlur) {
                    canvas.removeEventListener("blur", handleBlur);
                }
            }
            isDomA11yObserverActive = false;
            domA11yObserver?.takeRecords();
            domA11yObserver?.disconnect();
            domA11yObserver = null;

            // Clean up resources
            cleanupMapResources(mapInstanceRef.current, tooltipInstanceRef.current);
            mapInstanceRef.current = null;
            tooltipInstanceRef.current = null;
        };
    }, [
        containerRef,
        config?.mapStyle,
        cooperativeGestures,
        interactionOptions,
        isExportMode,
        isGeoChartA11yImprovementsEnabled,
        isKeyboardInteractionEnabled,
        isKeyboardRotationEnabled,
        locale,
        backend,
        maxZoom,
        tileset,
        intl,
        mapInstructionsId,
        mapCanvasTitle,
        legendPanelRef,
    ]);

    return { map, tooltip, isMapReady, error };
}
