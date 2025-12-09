// (C) 2025 GoodData Corporation

/**
 * Legend configuration shared by GeoChartNext components.
 *
 * @alpha
 */
export interface IGeoLegendConfigNext {
    /**
     * Enables legend rendering.
     *
     * @defaultValue true
     */
    enabled?: boolean;

    /**
     * Legend position. `"auto"` picks a placement based on available space.
     *
     * @defaultValue "auto"
     */
    position?: "top" | "right" | "bottom" | "left" | "auto";

    /**
     * Responsive behavior: `true` switches to fluid layout, `"autoPositionWithPopup"` renders a popup legend.
     *
     * @defaultValue false
     */
    responsive?: boolean | "autoPositionWithPopup";
}
