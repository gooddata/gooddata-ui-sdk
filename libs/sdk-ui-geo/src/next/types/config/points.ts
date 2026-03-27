// (C) 2025-2026 GoodData Corporation

/**
 * Supported pushpin marker size multipliers.
 *
 * @public
 */
export type GeoChartPushpinSizeOption = "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x" | "default";

/**
 * Pushpin marker shape types.
 *
 * - `"circle"` – default circle markers
 * - `"iconByValue"` – icon resolved from a `GDC.geo.icon` label
 * - `"oneIcon"` – a single static icon chosen from the sprite sheet
 *
 * @remarks
 * Icon-based shapes require additional configuration:
 * - `"iconByValue"` requires the layer to provide a `geoIcon` attribute.
 * - `"oneIcon"` requires `IGeoChartPointsConfig.icon` to be set.
 *
 * If the required icon source is missing, the icon marker may not render.
 *
 * @public
 */
export type GeoChartShapeType = "circle" | "iconByValue" | "oneIcon";

/**
 * Pushpin-specific configuration.
 *
 * @public
 */
export interface IGeoChartPointsConfig {
    /**
     * Minimum marker size multiplier used when size measure is present.
     *
     * @defaultValue "normal"
     */
    minSize?: GeoChartPushpinSizeOption;

    /**
     * Maximum marker size multiplier used when size measure is present.
     *
     * @defaultValue "normal"
     */
    maxSize?: GeoChartPushpinSizeOption;

    /**
     * Groups nearby points into clusters.
     *
     * @defaultValue false
     */
    groupNearbyPoints?: boolean;

    /**
     * Marker shape type.
     *
     * @remarks
     * Icon-based shapes do not fall back to circle markers automatically.
     * Use `"iconByValue"` only together with a layer `geoIcon` attribute,
     * and use `"oneIcon"` only when `icon` is set.
     *
     * @defaultValue "circle"
     */
    shapeType?: GeoChartShapeType;

    /**
     * Icon name from the sprite sheet.
     *
     * @remarks
     * This must be set when `shapeType` is `"oneIcon"`. If it is missing,
     * the icon marker may not render.
     */
    icon?: string;
}

/**
 * Valid pushpin size option values.
 *
 * @public
 */
export const VALID_PUSHPIN_SIZE_OPTIONS: readonly GeoChartPushpinSizeOption[] = [
    "0.5x",
    "0.75x",
    "normal",
    "1.25x",
    "1.5x",
    "default",
] as const;

/**
 * Type guard verifying allowed size option values.
 *
 * @public
 */
export function isValidPushpinSizeOption(value: string): value is GeoChartPushpinSizeOption {
    return (
        value === "0.5x" ||
        value === "0.75x" ||
        value === "normal" ||
        value === "1.25x" ||
        value === "1.5x" ||
        value === "default"
    );
}
