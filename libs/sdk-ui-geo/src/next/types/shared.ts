// (C) 2025 GoodData Corporation

/**
 * Shared type definitions for GeoPushpinChartNext
 *
 * @remarks
 * These types are copied from the legacy implementation and modernized for the new implementation.
 * They represent core data structures used throughout the geo chart components.
 *
 * @internal
 */

/**
 * Represents geographic coordinates in latitude/longitude format
 *
 * @alpha
 */
export interface IGeoLngLat {
    /**
     * Latitude coordinate (-90 to 90)
     */
    lat: number;
    /**
     * Longitude coordinate (-180 to 180)
     */
    lng: number;
}

/**
 * Represents geographic bounds defined by north-east and south-west coordinates
 *
 * @alpha
 */
export interface IGeoLngLatBounds {
    /**
     * North-east corner of the bounds
     */
    northEast: IGeoLngLat;
    /**
     * South-west corner of the bounds
     */
    southWest: IGeoLngLat;
}

/**
 * Represents a single item in the geo chart tooltip
 *
 * @alpha
 */
export interface IGeoTooltipItem {
    /**
     * Title/label for the tooltip item
     */
    title: string;
    /**
     * Value to display (can be string or number)
     */
    value: string | number;
    /**
     * Optional format string for number formatting
     */
    format?: string;
}

/**
 * Represents pushpin color configuration
 *
 * @remarks
 * Defines both border and background colors for map pushpins
 *
 * @alpha
 */
export interface IPushpinColor {
    /**
     * Border color in CSS color format (e.g., "rgb(233,237,241)")
     */
    border: string;
    /**
     * Background color in CSS color format (e.g., "rgba(0,211,152,0.7)")
     */
    background: string;
}

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
 * Represents a location item with coordinate data
 *
 * @alpha
 */
export interface IGeoLocationItem extends IGeoDataItem {
    /**
     * Array of coordinates for each location
     */
    data: IGeoLngLat[];
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
 * Complete geo data structure
 *
 * @remarks
 * Contains all data needed to render the geo pushpin chart including
 * locations, sizes, colors, segments, and tooltip text
 *
 * @alpha
 */
export interface IGeoData {
    /**
     * Location coordinates for pushpins
     */
    location?: IGeoLocationItem;
    /**
     * Size measure data (determines pushpin size)
     */
    size?: IGeoMeasureItem;
    /**
     * Color measure data (determines pushpin color)
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

/**
 * Metadata about available legend types
 *
 * @remarks
 * Indicates which legends should be displayed based on the data configuration
 *
 * @alpha
 */
export interface IAvailableLegends {
    /**
     * Whether to show category legend (based on segment data)
     */
    hasCategoryLegend: boolean;
    /**
     * Whether to show color legend (based on color measure)
     */
    hasColorLegend: boolean;
    /**
     * Whether to show size legend (based on size measure)
     */
    hasSizeLegend: boolean;
}

/**
 * Callback function invoked when map center position changes
 *
 * @param center - New center coordinates
 *
 * @alpha
 */
export type CenterPositionChangedCallback = (center: IGeoLngLat) => void;

/**
 * Callback function invoked when map zoom level changes
 *
 * @param zoom - New zoom level (0-22)
 *
 * @alpha
 */
export type ZoomChangedCallback = (zoom: number) => void;
