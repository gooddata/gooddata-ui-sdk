// (C) 2025-2026 GoodData Corporation

/**
 * Corner positions accepted by the new geo legend implementation.
 *
 * @public
 */
export type GeoLegendCornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/**
 * Position values accepted by the new geo legend implementation.
 *
 * @public
 */
export type GeoLegendPosition = GeoLegendCornerPosition | "auto";

/**
 * Legacy edge-based legend positions still accepted for read-time normalization.
 *
 * @deprecated Use corner-based positions instead:
 * - `"top"` maps to `"top-right"`
 * - `"right"` maps to `"top-right"`
 * - `"bottom"` maps to `"bottom-right"`
 * - `"left"` maps to `"top-left"`
 *
 * @public
 */
export type LegacyGeoLegendPosition = "top" | "right" | "bottom" | "left";

/**
 * Legend configuration shared by GeoChart components.
 *
 * @public
 */
export interface IGeoChartLegendConfig {
    /**
     * Enables legend rendering.
     *
     * @defaultValue true
     */
    enabled?: boolean;

    /**
     * Legend position. `"auto"` picks a placement based on available space.
     * Legacy edge-based values are still accepted for backward compatibility, but are deprecated and normalized
     * to corner values:
     * - `"top"` maps to `"top-right"`
     * - `"right"` maps to `"top-right"`
     * - `"bottom"` maps to `"bottom-right"`
     * - `"left"` maps to `"top-left"`
     *
     * @defaultValue "auto"
     */
    position?: GeoLegendPosition | LegacyGeoLegendPosition;

    /**
     * Responsive behavior: `true` switches to fluid layout, `"autoPositionWithPopup"` renders a popup legend.
     *
     * @defaultValue false
     */
    responsive?: boolean | "autoPositionWithPopup";
}
