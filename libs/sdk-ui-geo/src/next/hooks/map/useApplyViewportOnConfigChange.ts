// (C) 2025-2026 GoodData Corporation

import { useEffect, useMemo, useRef } from "react";

import type { IMapFacade } from "../../layers/common/mapFacade.js";
import { resolveResponsiveViewport } from "../../map/viewport/responsiveViewport.js";
import { applyViewport } from "../../map/viewport/viewportCalculation.js";
import { computeViewportFromConfig, getViewportConfigKey } from "../../map/viewport/viewportResolution.js";
import type { IGeoChartConfig } from "../../types/config/unified.js";
import type { IMapViewport } from "../../types/map/provider.js";
import { prefersReducedMotion } from "../../utils/prefersReducedMotion.js";

const CENTER_EPSILON = 0.000001;
const ZOOM_EPSILON = 0.0001;

function isClose(a: number, b: number, epsilon: number): boolean {
    return Math.abs(a - b) <= epsilon;
}

function isViewportAlreadyApplied(map: IMapFacade, viewport: Partial<IMapViewport>): boolean {
    if (viewport.bounds) {
        const mapBounds = map.getBounds();

        return (
            isClose(mapBounds.southWest.lat, viewport.bounds.southWest.lat, CENTER_EPSILON) &&
            isClose(mapBounds.southWest.lng, viewport.bounds.southWest.lng, CENTER_EPSILON) &&
            isClose(mapBounds.northEast.lat, viewport.bounds.northEast.lat, CENTER_EPSILON) &&
            isClose(mapBounds.northEast.lng, viewport.bounds.northEast.lng, CENTER_EPSILON)
        );
    }

    if (!viewport.center || viewport.zoom === undefined) {
        return false;
    }

    const mapCenter = map.getCenter();
    const mapZoom = map.getZoom();

    return (
        isClose(mapCenter.lat, viewport.center.lat, CENTER_EPSILON) &&
        isClose(mapCenter.lng, viewport.center.lng, CENTER_EPSILON) &&
        isClose(mapZoom, viewport.zoom, ZOOM_EPSILON)
    );
}

/**
 * Applies configured viewport whenever the viewport-related config changes.
 *
 * @remarks
 * `useMapInitialization` intentionally captures only the initial viewport and does not re-center the map on
 * prop changes. This hook provides the missing behavior for Analytical Designer: when the user changes
 * "Default viewport", we apply the new viewport to the already-initialized map.
 *
 * We only react to viewport-relevant config changes (`bounds`, `center`/`zoom`, or `viewport.area`).
 * Data changes are intentionally ignored to avoid unexpected re-centering during interactions.
 *
 * Contract note:
 * custom viewport persists `bounds` as the preferred representation. When AD stores the
 * currently visible bounds after a user pan/zoom, those bounds already describe the live map.
 * Replaying them through `cameraForBounds()` would zoom out because the fit operation adds padding,
 * so matching bounds must be treated as an already-applied viewport and skipped here.
 *
 * The current `dataViewport` is still passed in so that switching to `"auto"` (or clearing the preset)
 * applies the latest data-derived bounds.
 *
 * @internal
 */
export function useApplyViewportOnConfigChange(
    map: IMapFacade | null,
    isMapReady: boolean,
    config: IGeoChartConfig | undefined,
    dataViewport: Partial<IMapViewport> | null,
): void {
    const hasConfig = config !== undefined;
    const enableGeoChartsViewportConfig = config?.enableGeoChartsViewportConfig;
    const bounds = config?.bounds;
    const center = config?.center;
    const zoom = config?.zoom;
    const applyViewportNavigation = config?.applyViewportNavigation;
    const area = config?.viewport?.area;

    const viewportConfig = useMemo<IGeoChartConfig | undefined>(() => {
        if (!hasConfig) {
            return undefined;
        }

        return {
            enableGeoChartsViewportConfig,
            bounds,
            center,
            zoom,
            applyViewportNavigation,
            viewport: {
                area,
            },
        };
    }, [hasConfig, enableGeoChartsViewportConfig, bounds, center, zoom, applyViewportNavigation, area]);

    const configKey = useMemo(() => getViewportConfigKey(viewportConfig), [viewportConfig]);
    const previousConfigKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!map || !isMapReady) {
            return;
        }

        // This hook is intended for AD viewport controls.
        // Interactive runtimes (dashboards/embedded) already move the map directly.
        if (applyViewportNavigation !== false) {
            return;
        }

        const previousKey = previousConfigKeyRef.current;
        previousConfigKeyRef.current = configKey;

        // First run: map just initialized with the initial viewport already applied.
        if (previousKey === null) {
            return;
        }

        if (previousKey === configKey) {
            return;
        }

        const viewportToApply = computeViewportFromConfig(viewportConfig, dataViewport);
        if (!viewportToApply) {
            return;
        }
        const responsiveViewportToApply = resolveResponsiveViewport(
            map,
            viewportToApply,
            dataViewport,
            viewportConfig,
        );

        // Custom viewport persistence updates the config from live map state.
        // Re-applying an already-current viewport causes redundant animation and,
        // for bounds-based custom viewports, zooms out because cameraForBounds applies padding.
        if (isViewportAlreadyApplied(map, responsiveViewportToApply)) {
            return;
        }

        applyViewport(map, responsiveViewportToApply, !prefersReducedMotion());
    }, [map, isMapReady, applyViewportNavigation, configKey, viewportConfig, dataViewport]);
}
