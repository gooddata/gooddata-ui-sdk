// (C) 2025-2026 GoodData Corporation

import { useEffect, useMemo, useRef } from "react";

import { type ContentRect } from "react-measure";

import type { IMapFacade } from "../../layers/common/mapFacade.js";
import { resolveResponsiveViewport } from "../../map/viewport/responsiveViewport.js";
import { applyViewport } from "../../map/viewport/viewportCalculation.js";
import { type IGeoChartConfig } from "../../types/config/unified.js";
import { type IMapViewport } from "../../types/map/provider.js";

/**
 * Handle map resize when container dimensions change
 *
 * @remarks
 * This hook monitors container dimensions and updates the map when they change.
 * It performs two operations:
 * 1. Calls map.resize() to update the MapLibre canvas size
 * 2. Reapplies the viewport so fitBounds can recalculate based on new dimensions
 *
 * This is separate from viewport updates triggered by config changes (e.g. Analytical Designer viewport).
 * Those are handled in `useApplyViewportOnConfigChange`.
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
    dataViewport: Partial<IMapViewport> | null,
    config: IGeoChartConfig | undefined,
): void {
    const area = config?.viewport?.area;
    const viewportConfig = useMemo<IGeoChartConfig | undefined>(() => {
        if (area === undefined) {
            return undefined;
        }

        return {
            viewport: { area },
        };
    }, [area]);

    const prevContainerRect = useRef<ContentRect | null>(null);
    const previousMapRef = useRef<IMapFacade | null>(null);

    useEffect(() => {
        if (!map || !isMapReady || !chartContainerRect?.client || !viewport) {
            return;
        }

        if (previousMapRef.current !== map) {
            previousMapRef.current = map;
        }

        const prev = prevContainerRect.current?.client;
        const curr = chartContainerRect.client;
        const { width, height } = curr;
        const hasResized = !prev || prev.width !== width || prev.height !== height;

        if (hasResized) {
            prevContainerRect.current = chartContainerRect;
            map.resize();
            const viewportToApply = resolveResponsiveViewport(map, viewport, dataViewport, viewportConfig);
            applyViewport(map, viewportToApply, false);
        }
    }, [map, isMapReady, chartContainerRect, viewport, dataViewport, viewportConfig]);
}
