// (C) 2025-2026 GoodData Corporation

import type { GeoChartPushpinSizeOption } from "../types/config/points.js";
import type { IGeoChartViewportArea } from "../types/config/viewport.js";

/**
 * Default configuration values consumed by GeoChart wrappers.
 *
 * @public
 */
export const GEO_CHART_DEFAULTS = {
    /**
     * Default area fill opacity (0-1 range).
     */
    AREA_FILL_OPACITY: 0.7,

    /**
     * Default area border color.
     */
    AREA_BORDER_COLOR: "#FFFFFF",

    /**
     * Default area border width in pixels.
     */
    AREA_BORDER_WIDTH: 1,

    /**
     * Default minimum pushpin size multiplier.
     */
    PUSHPIN_MIN_SIZE: "normal" satisfies GeoChartPushpinSizeOption,

    /**
     * Default maximum pushpin size multiplier.
     */
    PUSHPIN_MAX_SIZE: "normal" satisfies GeoChartPushpinSizeOption,

    /**
     * Whether pushpins cluster nearby points by default.
     */
    PUSHPIN_GROUP_NEARBY_POINTS: true,

    /**
     * Default viewport preset.
     */
    VIEWPORT_AREA: "auto" satisfies IGeoChartViewportArea,

    /**
     * Whether viewport interaction is locked by default.
     */
    VIEWPORT_FROZEN: false,

    /**
     * Whether legend rendering is enabled by default.
     */
    LEGEND_ENABLED: true,

    /**
     * Default legend position.
     */
    LEGEND_POSITION: "auto" as const,

    /**
     * Whether legend responsiveness is enabled by default.
     */
    LEGEND_RESPONSIVE: false,
} as const;

/**
 * Type for the GEO_CHART_DEFAULTS object.
 *
 * @public
 */
export type IGeoChartDefaults = typeof GEO_CHART_DEFAULTS;
