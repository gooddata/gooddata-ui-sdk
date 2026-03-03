// (C) 2025-2026 GoodData Corporation

/**
 * Viewport presets for GeoChart.
 *
 * @public
 */
export type IGeoChartViewportArea =
    | "auto"
    | "custom"
    | "continent_af"
    | "continent_as"
    | "continent_au"
    | "continent_eu"
    | "continent_na"
    | "continent_sa"
    | "world";

/**
 * Viewport area values that refer to a concrete geographic region
 * (everything except "auto" and "custom").
 *
 * @internal
 */
export type IConcreteViewportPreset = Exclude<IGeoChartViewportArea, "auto" | "custom">;

/**
 * All supported viewport area values as a runtime array.
 *
 * @remarks
 * Derived from {@link IGeoChartViewportArea} to keep the type and runtime list in sync.
 *
 * @internal
 */
const VIEWPORT_AREAS: readonly IGeoChartViewportArea[] = [
    "auto",
    "custom",
    "continent_af",
    "continent_as",
    "continent_au",
    "continent_eu",
    "continent_na",
    "continent_sa",
    "world",
];

/**
 * Navigation interaction settings for geo viewport.
 *
 * @public
 */
export interface IGeoChartViewportNavigation {
    /**
     * Enable or disable pan interactions.
     *
     * @defaultValue true
     */
    pan?: boolean;

    /**
     * Enable or disable zoom interactions.
     *
     * @defaultValue true
     */
    zoom?: boolean;
}

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

    /**
     * Navigation interaction settings.
     */
    navigation?: IGeoChartViewportNavigation;
}

/**
 * Valid viewport presets.
 *
 * @public
 */
export const VALID_VIEWPORT_AREAS: readonly IGeoChartViewportArea[] = VIEWPORT_AREAS;

const VIEWPORT_AREA_SET: ReadonlySet<string> = new Set(VIEWPORT_AREAS);

/**
 * Type guard verifying supported viewport presets.
 *
 * @public
 */
export function isValidViewportArea(value: string): value is IGeoChartViewportArea {
    return VIEWPORT_AREA_SET.has(value);
}

/**
 * Type guard that returns true when the area refers to a concrete geographic preset
 * (i.e. not "auto" and not "custom").
 *
 * @internal
 */
export function isConcreteViewportPreset(
    area: IGeoChartViewportArea | undefined,
): area is IConcreteViewportPreset {
    return area !== undefined && area !== "auto" && area !== "custom" && VIEWPORT_AREA_SET.has(area);
}
