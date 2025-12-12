// (C) 2025 GoodData Corporation

import { type IGeoCommonData, type IGeoDataItem, type IGeoMeasureItem } from "./common.js";
import { type IGeoLngLat } from "../common/coordinates.js";

/**
 * Represents a location item with coordinate data
 *
 * @alpha
 */
export interface IPushpinLocationItem extends IGeoDataItem {
    /**
     * Array of coordinates for each location
     */
    data: IGeoLngLat[];
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
 * Complete geo data structure
 *
 * @remarks
 * Contains all data needed to render the geo pushpin chart including
 * locations, sizes, colors, segments, and tooltip text
 *
 * @alpha
 */
export interface IPushpinGeoData extends IGeoCommonData {
    /**
     * Location coordinates for pushpins
     */
    location?: IPushpinLocationItem;
    /**
     * Size measure data (determines pushpin size)
     */
    size?: IGeoMeasureItem;
}
