// (C) 2025-2026 GoodData Corporation

import type { IGeoChartConfig } from "../../types/config/unified.js";
import { isConcreteViewportPreset } from "../../types/config/viewport.js";
import type { IMapViewport } from "../../types/map/provider.js";
import { DEFAULT_CENTER, DEFAULT_ZOOM, VIEWPORTS } from "../runtime/mapConfig.js";

/**
 * Resolves the map viewport from configuration, falling back to a data-derived viewport.
 *
 * Priority order (highest wins):
 * 1. AD-only override: preset `config.viewport.area` (when `applyViewportNavigation === false`)
 * 2. `config.center` + `config.zoom` (explicit center/zoom)
 * 3. `config.viewport.area` (preset area like "continent_eu")
 * 4. `dataViewport` (computed from layer data; used for `"auto"`)
 * 5. Default fallback
 *
 * @remarks
 * This function is intentionally pure and cycle-free so it can be reused both:
 * - when selecting the initial viewport for map initialization, and
 * - when applying viewport changes (e.g. in Analytical Designer).
 *
 * @internal
 */
export function computeViewportFromConfig(
    config: IGeoChartConfig | undefined,
    dataViewport: Partial<IMapViewport> | null = null,
): Partial<IMapViewport> | null {
    if (!config) {
        return dataViewport;
    }

    const area = config.viewport?.area;

    // In AD runtime, preset changes must apply immediately even if stale center/zoom values are still present.
    if (config.applyViewportNavigation === false && isConcreteViewportPreset(area)) {
        const [southWest, northEast] = VIEWPORTS[area];
        return {
            bounds: { southWest, northEast },
        };
    }

    if (config.center) {
        return {
            center: config.center,
            zoom: config.zoom ?? DEFAULT_ZOOM,
        };
    }

    if (isConcreteViewportPreset(area)) {
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
export function getViewportConfigKey(config: IGeoChartConfig | undefined): string {
    const area = config?.viewport?.area;

    // Keep key aligned with computeViewportFromConfig for AD-specific precedence.
    if (config?.applyViewportNavigation === false && isConcreteViewportPreset(area)) {
        return `area:${area}`;
    }

    if (config?.center) {
        const zoom = config.zoom ?? DEFAULT_ZOOM;
        return `center:${config.center.lat}:${config.center.lng}:${zoom}`;
    }

    return `area:${area ?? "auto"}`;
}
