// (C) 2025 GoodData Corporation

import { type IGeoCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

/**
 * Generic legend item type for geo charts.
 *
 * @remarks
 * Type alias for IGeoCategoryLegendItem from sdk-ui-vis-commons.
 * Used by both pushpin and area layers for category legend rendering.
 *
 * @alpha
 */
export type IGeoLegendItem = IGeoCategoryLegendItem;

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
     *
     * @remarks
     * Optional because area charts never expose size data.
     */
    hasSizeLegend?: boolean;
}
