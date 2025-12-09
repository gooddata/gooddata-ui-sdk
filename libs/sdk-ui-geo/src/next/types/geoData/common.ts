// (C) 2025 GoodData Corporation

/**
 * Base interface for geo data items
 *
 * @alpha
 */
export interface IGeoDataItem {
    /**
     * Display name of the data item
     */
    name: string;
    /**
     * Index position in the data view
     */
    index: number;
}

/**
 * Represents an attribute item in geo data
 *
 * @alpha
 */
export interface IGeoAttributeItem extends IGeoDataItem {
    /**
     * Array of string values for the attribute
     */
    data: string[];
}

/**
 * Represents a segment item with URIs for drilling
 *
 * @alpha
 */
export interface IGeoSegmentItem extends IGeoAttributeItem {
    /**
     * URIs corresponding to segment values for drilling functionality
     */
    uris: string[];
}

/**
 * Represents a measure item with numeric data
 *
 * @alpha
 */
export interface IGeoMeasureItem extends IGeoDataItem {
    /**
     * Format string for displaying measure values
     */
    format: string;
    /**
     * Array of numeric values
     */
    data: number[];
}

/**
 * Common subset of geo data used by legends
 *
 * @alpha
 */
export interface IGeoCommonData {
    /**
     * Color measure data (determines pushpin or area color)
     */
    color?: IGeoMeasureItem;
    /**
     * Segment data (for categorization and drilling)
     */
    segment?: IGeoSegmentItem;
    /**
     * Additional tooltip text attribute
     */
    tooltipText?: IGeoAttributeItem;
}
