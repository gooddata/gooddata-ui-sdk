// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

import type { Map as MapLibreMap } from "maplibre-gl";
import { ContentRect } from "react-measure";

import { applyViewport } from "../../features/map/viewportManagement.js";
import { IMapViewport } from "../../types/mapProvider.js";

/**
 * Handle map resize when container dimensions change
 *
 * @remarks
 * This hook monitors container dimensions and updates the map when they change.
 * It performs two operations:
 * 1. Calls map.resize() to update the MapLibre canvas size
 * 2. Reapplies the viewport so fitBounds can recalculate based on new dimensions
 *
 * This is separate from viewport updates triggered by data/config changes.
 * Those are handled in useMapDataSync.
 *
 * @param map - MapLibre map instance (null if not initialized)
 * @param isMapReady - Whether map is ready for updates
 * @param chartContainerRect - Container dimensions from react-measure
 * @param viewport - Viewport configuration to reapply after resize
 *
 * @internal
 */
export function useMapResize(
    map: MapLibreMap | null,
    isMapReady: boolean,
    chartContainerRect: ContentRect | null,
    viewport: Partial<IMapViewport> | null,
): void {
    // Track previous dimensions to detect actual changes
    const prevContainerRect = useRef<ContentRect | null>(null);

    useEffect(() => {
        if (!map || !isMapReady || !chartContainerRect?.client || !viewport) {
            return;
        }

        // Check if dimensions actually changed (not just the object reference)
        const prev = prevContainerRect.current?.client;
        const curr = chartContainerRect.client;
        const hasResized = !prev || prev.width !== curr.width || prev.height !== curr.height;

        if (hasResized) {
            prevContainerRect.current = chartContainerRect;
            // Tell map to recalculate its canvas size to fit the new container dimensions
            map.resize();
            // Reapply viewport so fitBounds can recalculate based on new container size
            // Use applyViewport directly (not applyViewportSafely) since map is already loaded
            applyViewport(map, viewport, false);
        }
    }, [map, isMapReady, chartContainerRect, viewport]);
}
