// (C) 2025-2026 GoodData Corporation

import type { IGeoChartNextConfig } from "../../types/config/unified.js";
import type { IMapViewport } from "../../types/map/provider.js";
import { DEFAULT_CENTER, DEFAULT_ZOOM, VIEWPORTS } from "../runtime/mapConfig.js";

/**
 * Resolves the map viewport from configuration, falling back to a data-derived viewport.
 *
 * Priority order (highest wins):
 * 1. `config.center` + `config.zoom` (explicit center/zoom)
 * 2. `config.viewport.area` (preset area like "continent_eu")
 * 3. `dataViewport` (computed from layer data; used for `"auto"`)
 * 4. Default fallback
 *
 * @remarks
 * This function is intentionally pure and cycle-free so it can be reused both:
 * - when selecting the initial viewport for map initialization, and
 * - when applying viewport changes (e.g. in Analytical Designer).
 *
 * @internal
 */
export function computeViewportFromConfig(
    config: IGeoChartNextConfig | undefined,
    dataViewport: Partial<IMapViewport> | null = null,
): Partial<IMapViewport> | null {
    if (!config) {
        return dataViewport;
    }

    if (config.center) {
        return {
            center: config.center,
            zoom: config.zoom ?? DEFAULT_ZOOM,
        };
    }

    const area = config.viewport?.area;
    if (area && area !== "auto") {
        const [southWest, northEast] = VIEWPORTS[area];
        return {
            bounds: { southWest, northEast },
        };
    }

    return (
        dataViewport ?? {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
        }
    );
}

/**
 * Creates a stable key for viewport-relevant config so hooks can detect user changes.
 *
 * @remarks
 * We deliberately key only on values that should trigger viewport re-application:
 * - `center`/`zoom`, or
 * - `viewport.area`
 *
 * @internal
 */
export function getViewportConfigKey(config: IGeoChartNextConfig | undefined): string {
    if (config?.center) {
        const zoom = config.zoom ?? DEFAULT_ZOOM;
        return `center:${config.center.lat}:${config.center.lng}:${zoom}`;
    }

    return `area:${config?.viewport?.area ?? "auto"}`;
}
