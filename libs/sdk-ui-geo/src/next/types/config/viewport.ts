// (C) 2025-2026 GoodData Corporation

/**
 * Viewport presets for GeoChart.
 *
 * @public
 */
export type IGeoChartViewportArea =
    | "auto"
    | "continent_af"
    | "continent_as"
    | "continent_au"
    | "continent_eu"
    | "continent_na"
    | "continent_sa"
    | "world";

/**
 * Viewport configuration shared by GeoChart components.
 *
 * @public
 */
export interface IGeoChartViewport {
    /**
     * Initial viewport preset.
     *
     * @defaultValue "auto"
     */
    area?: IGeoChartViewportArea;

    /**
     * Locks user interaction when set to true.
     *
     * @defaultValue false
     */
    frozen?: boolean;
}

/**
 * Valid viewport presets.
 *
 * @public
 */
export const VALID_VIEWPORT_AREAS: readonly IGeoChartViewportArea[] = [
    "auto",
    "continent_af",
    "continent_as",
    "continent_au",
    "continent_eu",
    "continent_na",
    "continent_sa",
    "world",
] as const;

/**
 * Type guard verifying supported viewport presets.
 *
 * @public
 */
export function isValidViewportArea(value: string): value is IGeoChartViewportArea {
    return (
        value === "auto" ||
        value === "continent_af" ||
        value === "continent_as" ||
        value === "continent_au" ||
        value === "continent_eu" ||
        value === "continent_na" ||
        value === "continent_sa" ||
        value === "world"
    );
}
