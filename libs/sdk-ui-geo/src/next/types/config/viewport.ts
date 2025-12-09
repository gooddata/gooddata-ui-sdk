// (C) 2025 GoodData Corporation

/**
 * Viewport presets for GeoChartNext.
 *
 * @alpha
 */
export type IGeoConfigViewportAreaNext =
    | "auto"
    | "continent_af"
    | "continent_as"
    | "continent_au"
    | "continent_eu"
    | "continent_na"
    | "continent_sa"
    | "world";

/**
 * Viewport configuration shared by GeoChartNext components.
 *
 * @alpha
 */
export interface IGeoConfigViewportNext {
    /**
     * Initial viewport preset.
     *
     * @defaultValue "auto"
     */
    area?: IGeoConfigViewportAreaNext;

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
 * @internal
 */
export const VALID_VIEWPORT_AREAS: readonly IGeoConfigViewportAreaNext[] = [
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
 * @alpha
 */
export function isValidViewportArea(value: string): value is IGeoConfigViewportAreaNext {
    return VALID_VIEWPORT_AREAS.includes(value as IGeoConfigViewportAreaNext);
}
