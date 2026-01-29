// (C) 2025-2026 GoodData Corporation

import { type GeoLayerType } from "../layers/index.js";

/**
 * Legend group types supported by multi-layer legend.
 *
 * @remarks
 * - `"size"` - Size anchors legend (min/mid/max bubbles) for pushpin layers
 * - `"color"` - Categorical color legend items with color swatches
 * - `"colorScale"` - Numeric color scale (gradient) for measure-based coloring
 *
 * @internal
 */
export type LegendGroupKind = "size" | "color" | "colorScale";

/**
 * Size anchor item for pushpin size legend.
 *
 * @remarks
 * Represents a representative size anchor (e.g., min, mid, max)
 * in the pushpin size legend.
 *
 * @internal
 */
export interface ILegendSizeAnchorItem {
    /**
     * Item type discriminator.
     */
    type: "sizeAnchor";

    /**
     * Display label for the anchor (formatted value).
     */
    label: string;

    /**
     * Size in pixels for rendering the anchor circle.
     */
    sizePx: number;

    /**
     * Raw numeric value this anchor represents.
     */
    value: number;
}

/**
 * Color category item for categorical color legends.
 *
 * @remarks
 * Represents a single category with its assigned color
 * in a categorical color legend.
 *
 * @internal
 */
export interface ILegendColorCategoryItem {
    /**
     * Item type discriminator.
     */
    type: "colorCategory";

    /**
     * Display label for the category.
     */
    label: string;

    /**
     * CSS color string for the category swatch.
     */
    color: string;

    /**
     * Unique identifier (URI) for this category.
     * Used for toggle interactions.
     */
    uri: string;

    /**
     * Whether this category item is currently visible on the chart.
     * When false, the item appears visually disabled but still clickable.
     */
    isVisible: boolean;

    /**
     * Optional data point count for this category.
     */
    count?: number;
}

/**
 * Color scale item for numeric color legends (gradients).
 *
 * @remarks
 * Represents the color scale for measure-based coloring,
 * showing the gradient from min to max values.
 *
 * @internal
 */
export interface ILegendColorScaleItem {
    /**
     * Item type discriminator.
     */
    type: "colorScale";

    /**
     * Minimum value label.
     */
    minLabel: string;

    /**
     * Maximum value label.
     */
    maxLabel: string;

    /**
     * CSS color for minimum value.
     */
    minColor: string;

    /**
     * CSS color for maximum value.
     */
    maxColor: string;
}

/**
 * Union type for all legend items.
 *
 * @internal
 */
export type ILegendItem = ILegendSizeAnchorItem | ILegendColorCategoryItem | ILegendColorScaleItem;

/**
 * A group of related legend items within a section.
 *
 * @remarks
 * Groups legend items by type (size or color) with an optional title.
 *
 * @internal
 */
export interface ILegendGroup {
    /**
     * Type of items in this group.
     */
    kind: LegendGroupKind;

    /**
     * Display title for the group (e.g., "Size", "Color", measure name).
     */
    title: string;

    /**
     * Items in this group.
     */
    items: ILegendItem[];
}

/**
 * A section representing legend content for a single layer.
 *
 * @remarks
 * Each section corresponds to one geo layer and contains
 * one or more groups of legend items.
 *
 * @internal
 */
export interface ILegendSection {
    /**
     * Layer identifier this section belongs to.
     */
    layerId: string;

    /**
     * Human-readable title for the section (layer name).
     */
    layerTitle: string;

    /**
     * Type of the layer this section represents.
     */
    layerKind: GeoLayerType;

    /**
     * Groups of legend items in this section.
     */
    groups: ILegendGroup[];

    /**
     * Whether the layer is visible on the map.
     * Controls the toggle switch state.
     * Defaults to true if not specified.
     */
    isVisible?: boolean;

    /**
     * Whether the section content is expanded/collapsed.
     * Controls the expand/collapse chevron state.
     * Defaults to true if not specified.
     */
    isExpanded?: boolean;
}

/**
 * Complete legend model for multi-layer geo charts.
 *
 * @remarks
 * Contains all sections (one per layer) needed to render
 * a complete multi-layer legend.
 *
 * @internal
 */
export interface ILegendModel {
    /**
     * Title for the entire legend panel (typically the insight title).
     */
    title?: string;

    /**
     * Sections in display order (matches layer rendering order).
     */
    sections: ILegendSection[];
}

/**
 * Type guard for size anchor items.
 *
 * @param item - Legend item to check
 * @returns true if item is a size anchor item
 *
 * @internal
 */
export function isLegendSizeAnchorItem(item: ILegendItem): item is ILegendSizeAnchorItem {
    return item.type === "sizeAnchor";
}

/**
 * Type guard for color category items.
 *
 * @param item - Legend item to check
 * @returns true if item is a color category item
 *
 * @internal
 */
export function isLegendColorCategoryItem(item: ILegendItem): item is ILegendColorCategoryItem {
    return item.type === "colorCategory";
}

/**
 * Type guard for color scale items.
 *
 * @param item - Legend item to check
 * @returns true if item is a color scale item
 *
 * @internal
 */
export function isLegendColorScaleItem(item: ILegendItem): item is ILegendColorScaleItem {
    return item.type === "colorScale";
}
