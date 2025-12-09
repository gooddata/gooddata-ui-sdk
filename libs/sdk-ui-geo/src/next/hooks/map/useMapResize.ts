// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

import { ContentRect } from "react-measure";

import type { IMapFacade } from "../../layers/common/mapFacade.js";
import { applyViewport } from "../../map/viewport/viewportCalculation.js";
import { IMapViewport } from "../../types/map/provider.js";

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
    map: IMapFacade | null,
    isMapReady: boolean,
    chartContainerRect: ContentRect | null,
    viewport: Partial<IMapViewport> | null,
): void {
    const prevContainerRect = useRef<ContentRect | null>(null);

    useEffect(() => {
        if (!map || !isMapReady || !chartContainerRect?.client || !viewport) {
            return;
        }

        const prev = prevContainerRect.current?.client;
        const curr = chartContainerRect.client;
        const { width, height } = curr;
        const hasResized = !prev || prev.width !== width || prev.height !== height;

        if (hasResized) {
            prevContainerRect.current = chartContainerRect;
            map.resize();
            applyViewport(map, viewport, false);
        }
    }, [map, isMapReady, chartContainerRect, viewport]);
}
