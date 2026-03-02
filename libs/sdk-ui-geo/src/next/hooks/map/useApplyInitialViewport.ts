// (C) 2026 GoodData Corporation

import { useEffect, useRef } from "react";

import type { IMapFacade } from "../../layers/common/mapFacade.js";
import { applyViewport } from "../../map/viewport/viewportCalculation.js";
import type { IGeoChartConfig } from "../../types/config/unified.js";
import type { IMapViewport } from "../../types/map/provider.js";

/**
 * Applies the data-derived initial viewport once, when it becomes available.
 *
 * @remarks
 * Map initialization captures the initial viewport only at creation time. In Storybook/offline runs the viewport is
 * often derived from async boundary loading (collection-items), so it may arrive after the map instance already exists.
 *
 * This hook applies that viewport exactly once per map instance, but only when the viewport is not explicitly
 * configured via `config.center` or a preset `config.viewport.area` (other than `"auto"`).
 *
 * @internal
 */
export function useApplyInitialViewport(
    map: IMapFacade | null,
    isMapReady: boolean,
    config: IGeoChartConfig | undefined,
    initialViewport: Partial<IMapViewport> | null,
): void {
    const appliedForMapRef = useRef<IMapFacade | null>(null);

    useEffect(() => {
        if (!map || !isMapReady) {
            return;
        }

        // Apply at most once per map instance.
        if (appliedForMapRef.current === map) {
            return;
        }

        const area = config?.viewport?.area;
        const hasExplicitViewport = Boolean(config?.center) || Boolean(area && area !== "auto");
        if (hasExplicitViewport) {
            appliedForMapRef.current = map;
            return;
        }

        if (!initialViewport) {
            return;
        }

        applyViewport(map, initialViewport, false);
        appliedForMapRef.current = map;
    }, [map, isMapReady, config?.center, config?.viewport?.area, initialViewport]);
}
