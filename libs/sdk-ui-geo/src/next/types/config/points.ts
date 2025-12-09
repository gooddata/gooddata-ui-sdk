// (C) 2025 GoodData Corporation

/**
 * Supported pushpin marker size multipliers.
 *
 * @alpha
 */
export type PushpinSizeOptionNext = "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x" | "default";

/**
 * Pushpin-specific configuration.
 *
 * @alpha
 */
export interface IGeoPointsConfigNext {
    /**
     * Minimum marker size multiplier used when size measure is present.
     *
     * @defaultValue "normal"
     */
    minSize?: PushpinSizeOptionNext;

    /**
     * Maximum marker size multiplier used when size measure is present.
     *
     * @defaultValue "normal"
     */
    maxSize?: PushpinSizeOptionNext;

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
 * @internal
 */
export const VALID_PUSHPIN_SIZE_OPTIONS: readonly PushpinSizeOptionNext[] = [
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
 * @alpha
 */
export function isValidPushpinSizeOption(value: string): value is PushpinSizeOptionNext {
    return VALID_PUSHPIN_SIZE_OPTIONS.includes(value as PushpinSizeOptionNext);
}
