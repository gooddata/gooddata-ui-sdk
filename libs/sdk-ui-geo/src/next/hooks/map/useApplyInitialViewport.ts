// (C) 2026 GoodData Corporation

import { useEffect, useRef } from "react";

import type { IMapFacade } from "../../layers/common/mapFacade.js";
import { applyViewport } from "../../map/viewport/viewportCalculation.js";
import type { IGeoChartConfig } from "../../types/config/unified.js";
import type { IMapViewport } from "../../types/map/provider.js";

/**
 * Applies late data-derived viewport once, after map readiness.
 *
 * @remarks
 * Map initialization captures viewport only at creation time. In some flows (for example async boundary loading),
 * data-derived bounds can arrive after the map instance already exists.
 *
 * Explicit viewports (`config.center` or non-`auto` area) are handled at map initialization time.
 * This hook only handles `auto` mode when real data bounds become available later.
 *
 * @internal
 */
export function useApplyInitialViewport(
    map: IMapFacade | null,
    isMapReady: boolean,
    config: IGeoChartConfig | undefined,
    initialViewport: Partial<IMapViewport> | null,
): void {
    const hasAppliedInitialViewportRef = useRef(false);

    useEffect(() => {
        if (!map || !isMapReady) {
            return;
        }

        // Apply late initial viewport only once for the controller lifecycle.
        // Basemap/style changes can recreate the map instance, but should not snap the camera back.
        if (hasAppliedInitialViewportRef.current) {
            return;
        }

        const area = config?.viewport?.area;
        const hasExplicitViewport = Boolean(config?.center) || Boolean(area && area !== "auto");
        if (hasExplicitViewport) {
            hasAppliedInitialViewportRef.current = true;
            return;
        }

        if (!initialViewport?.bounds) {
            return;
        }

        applyViewport(map, initialViewport, false);
        hasAppliedInitialViewportRef.current = true;
    }, [map, isMapReady, config?.center, config?.viewport?.area, initialViewport]);
}
