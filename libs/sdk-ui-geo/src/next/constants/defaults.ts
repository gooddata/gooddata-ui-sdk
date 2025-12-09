// (C) 2025 GoodData Corporation

import type { PushpinSizeOptionNext } from "../types/config/points.js";
import type { IGeoConfigViewportAreaNext } from "../types/config/viewport.js";

/**
 * Default configuration values consumed by GeoChartNext wrappers.
 *
 * @alpha
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
    PUSHPIN_MIN_SIZE: "normal" as PushpinSizeOptionNext,

    /**
     * Default maximum pushpin size multiplier.
     */
    PUSHPIN_MAX_SIZE: "normal" as PushpinSizeOptionNext,

    /**
     * Whether pushpins cluster nearby points by default.
     */
    PUSHPIN_GROUP_NEARBY_POINTS: true,

    /**
     * Default viewport preset.
     */
    VIEWPORT_AREA: "auto" as IGeoConfigViewportAreaNext,

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
 * @alpha
 */
export type IGeoChartDefaults = typeof GEO_CHART_DEFAULTS;
