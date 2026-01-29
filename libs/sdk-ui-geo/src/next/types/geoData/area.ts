// (C) 2025-2026 GoodData Corporation

import { type IGeoCommonData, type IGeoDataItem } from "./common.js";

/**
 * Represents a geographic area item with polygon/boundary data
 *
 * @internal
 */
export interface IGeoAreaItem extends IGeoDataItem {
    /**
     * Geographic identifiers for areas (e.g., ISO country codes, region IDs)
     */
    data: string[];
    /**
     * URIs corresponding to area values for drilling functionality
     */
    uris: string[];
}

/**
 * Complete area geo data structure
 *
 * @remarks
 * Contains all data needed to render the geo area chart including
 * geographic areas, color values, segments, and tooltip text
 *
 * @internal
 */
export interface IAreaGeoData extends IGeoCommonData {
    /**
     * Geographic area identifiers
     */
    area?: IGeoAreaItem;
}
