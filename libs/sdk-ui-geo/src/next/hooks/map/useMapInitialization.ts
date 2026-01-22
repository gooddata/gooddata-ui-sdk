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
import { initializeMapLibreMap } from "../../map/runtime/mapInitialization.js";
import { type IGeoChartNextConfig } from "../../types/config/unified.js";
import { type IMapViewport } from "../../types/map/provider.js";
import type { GeoTileset } from "../../types/map/tileset.js";
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
 * @param intl - react-intl instance for translations
 * @param config - Geo configuration (optional)
 * @param initialViewport - Pre-calculated viewport from data (optional)
 * @returns Map instance, tooltip, ready state, and error
 *
 * @internal
 */
export function useMapInitialization(
    containerRef: RefObject<HTMLDivElement | null>,
    config?: IGeoChartNextConfig,
    initialViewport?: Partial<IMapViewport> | null,
    backend?: IAnalyticalBackend,
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
    const maxZoom = typeof config?.maxZoomLevel === "number" ? config.maxZoomLevel : undefined;
    const tileset: GeoTileset = config?.tileset ?? "default";

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        let isMounted = true;

        initializeMapLibreMap(
            {
                container,
                bounds: initialViewportRef.current.bounds,
                center: initialViewportRef.current.center,
                zoom: initialViewportRef.current.zoom,
                cooperativeGestures,
                interactive: !isViewportFrozen,
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

            // Clean up resources
            cleanupMapResources(mapInstanceRef.current, tooltipInstanceRef.current);
            mapInstanceRef.current = null;
            tooltipInstanceRef.current = null;
        };
    }, [
        containerRef,
        config?.mapStyle,
        cooperativeGestures,
        isViewportFrozen,
        isExportMode,
        locale,
        backend,
        maxZoom,
        tileset,
    ]);

    return { map, tooltip, isMapReady, error };
}
