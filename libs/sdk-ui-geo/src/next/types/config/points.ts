// (C) 2025-2026 GoodData Corporation

/**
 * Supported pushpin marker size multipliers.
 *
 * @public
 */
export type GeoChartPushpinSizeOption = "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x" | "default";

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
