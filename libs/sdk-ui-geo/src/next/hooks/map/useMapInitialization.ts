// (C) 2025 GoodData Corporation

import { RefObject, useEffect, useMemo, useRef, useState } from "react";

import type { Map as MapLibreMap, Popup, StyleSpecification } from "maplibre-gl";
import { IntlShape } from "react-intl";

import { initializeMapLibreMap } from "../../features/map/initializeMap.js";
import { IGeoPushpinChartNextConfig } from "../../types/config.js";
import { IMapViewport } from "../../types/mapProvider.js";
import { generateMapLibreLocale } from "../../utils/mapLocale.js";

/**
 * Hook return value
 *
 * @internal
 */
export interface IUseMapInitializationResult {
    /**
     * MapLibre map instance (null until initialized)
     */
    map: MapLibreMap | null;

    /**
     * Tooltip popup instance (null until initialized)
     */
    tooltip: Popup | null;

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
function cleanupMapResources(map: MapLibreMap | null, tooltip: Popup | null): void {
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
    intl: IntlShape,
    config?: IGeoPushpinChartNextConfig,
    initialViewport?: Partial<IMapViewport> | null,
): IUseMapInitializationResult {
    const [map, setMap] = useState<MapLibreMap | null>(null);
    const [tooltip, setTooltip] = useState<Popup | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Refs for instance tracking and cleanup
    const mapInstanceRef = useRef<MapLibreMap | null>(null);
    const tooltipInstanceRef = useRef<Popup | null>(null);

    // Capture initial viewport config (prevents re-centering when config changes)
    // Prioritize initialViewport from data, then fall back to config
    const initialCenterRef = useRef(initialViewport?.center ?? config?.center);
    const initialZoomRef = useRef(initialViewport?.zoom ?? config?.zoom);
    const initialBoundsRef = useRef(initialViewport?.bounds);

    // Update initial refs if map hasn't been created yet
    useEffect(() => {
        if (!mapInstanceRef.current) {
            initialCenterRef.current = initialViewport?.center ?? config?.center;
            initialZoomRef.current = initialViewport?.zoom ?? config?.zoom;
            initialBoundsRef.current = initialViewport?.bounds;
        }
    }, [config?.center, config?.zoom, initialViewport]);

    // Generate locale for cooperative gestures
    const cooperativeGestures = config?.cooperativeGestures ?? true;
    const locale = useMemo(() => {
        return cooperativeGestures ? generateMapLibreLocale(intl) : undefined;
    }, [cooperativeGestures, intl]);

    const isExportMode = config?.isExportMode ?? false;
    const isViewportFrozen = Boolean(config?.viewport?.frozen);

    // Create and manage map instance
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        let isMounted = true;

        // Initialize map with captured initial viewport
        // Use bounds if available (calculated from data), otherwise use center/zoom
        initializeMapLibreMap(
            {
                container,
                bounds: initialBoundsRef.current,
                center: initialCenterRef.current,
                zoom: initialZoomRef.current,
                cooperativeGestures,
                interactive: !isViewportFrozen,
                preserveDrawingBuffer: isExportMode,
                style: config?.mapStyle as string | StyleSpecification,
            },
            locale,
        )
            .then((result) => {
                if (isMounted) {
                    // Store in refs and state
                    mapInstanceRef.current = result.map;
                    tooltipInstanceRef.current = result.tooltip;
                    setMap(result.map);
                    setTooltip(result.tooltip);
                    setIsMapReady(true);
                } else {
                    // Component unmounted during initialization - clean up
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
    }, [containerRef, config?.mapStyle, cooperativeGestures, isViewportFrozen, isExportMode, locale]);

    return { map, tooltip, isMapReady, error };
}
