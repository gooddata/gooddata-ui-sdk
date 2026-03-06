// (C) 2025-2026 GoodData Corporation

import type { IGeoChartConfig } from "../../types/config/unified.js";
import { type IGeoChartViewportArea, isConcreteViewportPreset } from "../../types/config/viewport.js";
import type { IMapViewport } from "../../types/map/provider.js";
import { DEFAULT_CENTER, DEFAULT_ZOOM, VIEWPORTS } from "../runtime/mapConfig.js";

function resolveAreaViewport(
    area: IGeoChartViewportArea | undefined,
    dataViewport: Partial<IMapViewport> | null,
): Partial<IMapViewport> {
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
 * Resolves the map viewport from configuration, falling back to a data-derived viewport.
 *
 * Priority order (highest wins):
 * 1. Advanced viewport config: `config.viewport.area` (including `"auto"`) when explicitly set
 * 2. AD-only legacy override: preset `config.viewport.area` (when `applyViewportNavigation === false`)
 * 3. `config.center` + `config.zoom` (explicit center/zoom)
 * 4. `config.viewport.area` (preset area like "continent_eu")
 * 5. `dataViewport` (computed from layer data; used for `"auto"`)
 * 6. Default fallback
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
    const shouldPreferConfiguredArea =
        (config.enableGeoChartsViewportConfig ?? false) && area !== undefined && area !== "custom";

    if (shouldPreferConfiguredArea) {
        return resolveAreaViewport(area, dataViewport);
    }

    // In AD runtime, preset changes must apply immediately even if stale center/zoom values are still present.
    if (config.applyViewportNavigation === false && isConcreteViewportPreset(area)) {
        return resolveAreaViewport(area, dataViewport);
    }

    if (config.center) {
        return {
            center: config.center,
            zoom: config.zoom ?? DEFAULT_ZOOM,
        };
    }

    return resolveAreaViewport(area, dataViewport);
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
    const shouldPreferConfiguredArea =
        (config?.enableGeoChartsViewportConfig ?? false) && area !== undefined && area !== "custom";

    if (shouldPreferConfiguredArea) {
        return `area:${area}`;
    }

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
