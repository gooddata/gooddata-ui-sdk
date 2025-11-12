// (C) 2025 GoodData Corporation

// =============================================================================
// Pushpin Size Configuration
// =============================================================================

/**
 * Pushpin size mapping for different size options
 *
 * @remarks
 * Defines minimum and maximum pushpin sizes for each size preset
 */
export const PUSHPIN_SIZE_OPTIONS_MAP = {
    min: {
        default: 8,
        "0.5x": 4,
        "0.75x": 6,
        normal: 8,
        "1.25x": 10,
        "1.5x": 12,
    },
    max: {
        default: 60,
        "0.5x": 30,
        "0.75x": 45,
        normal: 60,
        "1.25x": 75,
        "1.5x": 90,
    },
} as const;

// =============================================================================
// Pushpin Color Configuration
// =============================================================================

/**
 * Default border color for pushpins
 */
export const DEFAULT_PUSHPIN_BORDER_COLOR_VALUE = "rgb(233,237,241)";

/**
 * Default opacity for pushpin colors
 */
export const DEFAULT_PUSHPIN_COLOR_OPACITY = 0.7;

/**
 * Number of color scale steps for color gradients
 *
 * @remarks
 * Used for creating color palettes. Should be less than 20 for performance.
 */
export const DEFAULT_PUSHPIN_COLOR_SCALE = 6;

/**
 * Default color value for pushpins
 *
 * @remarks
 * Used as fallback color when no color mapping is defined
 */
export const DEFAULT_PUSHPIN_COLOR_VALUE = "rgb(20,178,226)";

// =============================================================================
// Clustering Configuration
// =============================================================================

/**
 * Maximum zoom level at which to cluster points
 */
export const DEFAULT_CLUSTER_MAX_ZOOM = 14;

/**
 * Radius in pixels within which points will be clustered
 */
export const DEFAULT_CLUSTER_RADIUS = 50;

// =============================================================================
// Layer and Data Source Names
// =============================================================================

/**
 * Default name for the pushpin data source
 */
export const DEFAULT_DATA_SOURCE_NAME = "gdcPushpinsData";

/**
 * Default name for the pushpin layer
 */
export const DEFAULT_LAYER_NAME = "gdcPushpins";

/**
 * Default name for the cluster layer
 */
export const DEFAULT_CLUSTER_LAYER_NAME = "gdcClusters";

/**
 * Suffix for label layers
 */
export const LAYER_STYLE_LABEL_PREFIX = "-label";

// =============================================================================
// Pushpin Style Properties
// =============================================================================

/**
 * Pushpin circle style type
 */
export const PUSHPIN_STYLE_CIRCLE = "circle";

/**
 * Pushpin circle color property
 */
export const PUSHPIN_STYLE_CIRCLE_COLOR = "circle-color";

/**
 * Pushpin circle size property
 */
export const PUSHPIN_STYLE_CIRCLE_SIZE = "circle-radius";

/**
 * Pushpin circle stroke color property
 */
export const PUSHPIN_STYLE_CIRCLE_STROKE_COLOR = "circle-stroke-color";

// =============================================================================
// Data Limits
// =============================================================================

/**
 * Maximum number of data points to render
 *
 * @remarks
 * Limits are in place for performance reasons
 */
export const DEFAULT_DATA_POINTS_LIMIT = 50000;

// =============================================================================
// Tooltip Configuration
// =============================================================================

/**
 * Default options for pushpin styling
 */
export const DEFAULT_PUSHPIN_OPTIONS = {
    "circle-stroke-width": 1,
} as const;

/**
 * Value to display when data is null
 */
export const NULL_TOOLTIP_VALUE = "-";

/**
 * Value used for empty segment filters
 */
export const EMPTY_SEGMENT_VALUE = "empty-segment-filter";
