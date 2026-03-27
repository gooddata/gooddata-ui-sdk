// (C) 2025-2026 GoodData Corporation

import type { IGeoChartConfig } from "../../types/config/unified.js";
import { type IGeoChartViewportArea, isConcreteViewportPreset } from "../../types/config/viewport.js";
import type { IMapViewport } from "../../types/map/provider.js";
import { DEFAULT_CENTER, DEFAULT_ZOOM, PRESET_VIEWPORT_BOUNDS } from "../runtime/mapConfig.js";

function resolveAreaViewport(
    area: IGeoChartViewportArea | undefined,
    dataViewport: Partial<IMapViewport> | null,
): Partial<IMapViewport> {
    if (isConcreteViewportPreset(area)) {
        const [southWest, northEast] = PRESET_VIEWPORT_BOUNDS[area];
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
 * 3. `config.bounds`
 * 4. `config.center` + `config.zoom` (backward-compatible fallback when bounds are unavailable)
 * 5. `config.viewport.area` (preset area like "continent_eu")
 * 6. `dataViewport` (computed from layer data; used for `"auto"`)
 * 7. Default fallback
 *
 * @remarks
 * This function is intentionally pure and cycle-free so it can be reused both:
 * - when selecting the initial viewport for map initialization, and
 * - when applying viewport changes (e.g. in Analytical Designer).
 *
 * Contract for custom viewport:
 * - persist `bounds` whenever they are available
 * - prefer `bounds` over `center`/`zoom`
 * - keep `center`/`zoom` only as a backward-compatible fallback for older insights
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
        (config.enableGeoChartsViewportConfig ?? true) && area !== undefined && area !== "custom";

    if (shouldPreferConfiguredArea) {
        return resolveAreaViewport(area, dataViewport);
    }

    // In AD runtime, preset changes must apply immediately even if stale center/zoom values are still present.
    if (config.applyViewportNavigation === false && isConcreteViewportPreset(area)) {
        return resolveAreaViewport(area, dataViewport);
    }

    // Bounding box takes priority over center+zoom (container-size-independent).
    if (config.bounds) {
        return { bounds: config.bounds };
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
 * - `bounds`, or
 * - `center`/`zoom` as fallback, or
 * - `viewport.area`
 *
 * @internal
 */
export function getViewportConfigKey(config: IGeoChartConfig | undefined): string {
    const area = config?.viewport?.area;
    const shouldPreferConfiguredArea =
        (config?.enableGeoChartsViewportConfig ?? true) && area !== undefined && area !== "custom";

    if (shouldPreferConfiguredArea) {
        return `area:${area}`;
    }

    // Keep key aligned with computeViewportFromConfig for AD-specific precedence.
    if (config?.applyViewportNavigation === false && isConcreteViewportPreset(area)) {
        return `area:${area}`;
    }

    if (config?.bounds) {
        const { northEast: ne, southWest: sw } = config.bounds;
        return `bounds:${sw.lat}:${sw.lng}:${ne.lat}:${ne.lng}`;
    }

    if (config?.center) {
        const zoom = config.zoom ?? DEFAULT_ZOOM;
        return `center:${config.center.lat}:${config.center.lng}:${zoom}`;
    }

    return `area:${area ?? "auto"}`;
}
