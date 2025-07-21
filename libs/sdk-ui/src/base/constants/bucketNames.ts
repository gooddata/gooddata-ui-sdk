// (C) 2007-2025 GoodData Corporation
const MEASURES = "measures";
const SECONDARY_MEASURES = "secondary_measures";
const TERTIARY_MEASURES = "tertiary_measures";
const ATTRIBUTE = "attribute";
const ATTRIBUTE_FROM = "attribute_from";
const ATTRIBUTE_TO = "attribute_to";
const ATTRIBUTES = "attributes";
const VIEW = "view";
const STACK = "stack";
const TREND = "trend";
const SEGMENT = "segment";
const COLUMNS = "columns";
const LOCATION = "location";
const LONGITUDE = "longitude";
const LATITUDE = "latitude";
const SIZE = "size";
const COLOR = "color";
const TOOLTIP_TEXT = "tooltipText";

/**
 * Standard bucket names used in the different visualizations.
 * @internal
 */
export const BucketNames = {
    MEASURES,
    SECONDARY_MEASURES,
    TERTIARY_MEASURES,
    ATTRIBUTE,
    ATTRIBUTES,
    ATTRIBUTE_FROM,
    ATTRIBUTE_TO,
    VIEW,
    STACK,
    TREND,
    SEGMENT,
    COLUMNS,
    LOCATION,
    LONGITUDE,
    LATITUDE,
    SIZE,
    COLOR,
    TOOLTIP_TEXT,
} as const;

/**
 * @internal
 */
export type BucketNameKeys = keyof typeof BucketNames;

/**
 * @internal
 */
export type BucketNameValues = (typeof BucketNames)[BucketNameKeys];
