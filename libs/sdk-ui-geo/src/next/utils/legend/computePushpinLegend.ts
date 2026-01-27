// (C) 2025-2026 GoodData Corporation

import { formatLegendLabel } from "@gooddata/sdk-ui-vis-commons";

import { computeColorScale } from "./computeColorScale.js";
import type { IAvailableLegends, IGeoLegendItem } from "../../types/common/legends.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import {
    type ILegendColorCategoryItem,
    type ILegendGroup,
    type ILegendSection,
    type ILegendSizeAnchorItem,
} from "../../types/legend/model.js";

/**
 * Minimum size in pixels for smallest size anchor.
 */
const MIN_SIZE_PX = 8;

/**
 * Middle size in pixels for middle anchor.
 */
const MID_SIZE_PX = 16;

/**
 * Maximum size in pixels for largest size anchor.
 */
const MAX_SIZE_PX = 24;

/**
 * Default numeric symbols for legend label formatting.
 *
 * @internal
 */
const DEFAULT_NUMERIC_SYMBOLS = ["k", "M", "G", "T", "P", "E"];

/**
 * Computes size anchors from pushpin size data.
 *
 * @remarks
 * Creates 2-3 representative size anchors (min, mid, max) based on the
 * actual data range. Returns an empty array if no size data is available.
 *
 * @param geoData - Pushpin geo data with optional size measure
 * @param numericSymbols - Numeric symbols used for compact formatting (k, M, G, ...)
 * @returns Array of size anchor items
 *
 * @internal
 */
export function computeSizeAnchors(
    geoData: IPushpinGeoData,
    numericSymbols?: string[],
): ILegendSizeAnchorItem[] {
    const sizeData = geoData.size?.data;
    if (!sizeData || sizeData.length === 0) {
        return [];
    }

    const finiteValues = sizeData.filter(Number.isFinite);
    if (finiteValues.length === 0) {
        return [];
    }

    const symbols = numericSymbols && numericSymbols.length >= 4 ? numericSymbols : DEFAULT_NUMERIC_SYMBOLS;
    const format = geoData.size?.format;
    if (!format) {
        return [];
    }

    const minValue = Math.min(...finiteValues);
    const maxValue = Math.max(...finiteValues);
    const diff = maxValue - minValue;

    // If min equals max, show single anchor
    if (minValue === maxValue) {
        return [
            {
                type: "sizeAnchor",
                label: formatLegendLabel(minValue, format, diff, symbols),
                sizePx: MID_SIZE_PX,
                value: minValue,
            },
        ];
    }

    const midValue = (minValue + maxValue) / 2;

    return [
        {
            type: "sizeAnchor",
            label: formatLegendLabel(minValue, format, diff, symbols),
            sizePx: MIN_SIZE_PX,
            value: minValue,
        },
        {
            type: "sizeAnchor",
            label: formatLegendLabel(midValue, format, diff, symbols),
            sizePx: MID_SIZE_PX,
            value: midValue,
        },
        {
            type: "sizeAnchor",
            label: formatLegendLabel(maxValue, format, diff, symbols),
            sizePx: MAX_SIZE_PX,
            value: maxValue,
        },
    ];
}

/**
 * Converts existing legend items to color category items.
 *
 * @param legendItems - Base legend items from layer output
 * @returns Array of color category items
 *
 * @internal
 */
export function convertToColorCategories(legendItems: IGeoLegendItem[]): ILegendColorCategoryItem[] {
    return legendItems.map((item) => ({
        type: "colorCategory" as const,
        label: item.name,
        color: item.color ?? "#ccc", // Fallback color for undefined
        uri: item.uri,
        isVisible: item.isVisible,
    }));
}

/**
 * Input parameters for computing pushpin legend section.
 *
 * @internal
 */
export interface IComputePushpinLegendParams {
    layerId: string;
    layerName: string;
    geoData: IPushpinGeoData;
    legendItems: IGeoLegendItem[];
    availableLegends: IAvailableLegends;
    numericSymbols?: string[];
    colorScaleBaseColor?: string;
}

/**
 * Computes legend section for a pushpin layer.
 *
 * @remarks
 * Creates a legend section with size and/or color groups based on
 * available data. Size groups show min/mid/max anchors, color groups
 * show categorical items with swatches.
 * Returns null when there are no legend groups to display (e.g., location-only charts).
 *
 * @param params - Parameters for computation
 * @returns Legend section for the pushpin layer, or null if no legend data
 *
 * @alpha
 */
export function computePushpinLegend(params: IComputePushpinLegendParams): ILegendSection | null {
    const {
        layerId,
        layerName,
        geoData,
        legendItems,
        availableLegends,
        numericSymbols,
        colorScaleBaseColor,
    } = params;

    const groups: ILegendGroup[] = [];

    // Add size legend group if available
    if (availableLegends.hasSizeLegend) {
        const sizeAnchors = computeSizeAnchors(geoData, numericSymbols);
        if (sizeAnchors.length > 0) {
            groups.push({
                kind: "size",
                title: geoData.size?.name ?? "Size",
                items: sizeAnchors,
            });
        }
    }

    // Add numeric color scale group if available (Metric - Color, color measure without segment)
    // Order: Size -> Metric-Color -> Segment By
    if (availableLegends.hasColorLegend && geoData.color) {
        const colorScale = computeColorScale(
            geoData.color.data,
            geoData.color.format,
            numericSymbols,
            colorScaleBaseColor,
        );
        if (colorScale) {
            groups.push({
                kind: "colorScale",
                title: geoData.color.name,
                items: [colorScale],
            });
        }
    }

    // Add category legend group if available (Segment By)
    if (availableLegends.hasCategoryLegend && legendItems.length > 0) {
        const colorCategories = convertToColorCategories(legendItems);
        groups.push({
            kind: "color",
            title: geoData.segment?.name ?? "Color",
            items: colorCategories,
        });
    }

    // Return null when there are no legend groups (e.g., location-only charts)
    if (groups.length === 0) {
        return null;
    }

    return {
        layerId,
        layerTitle: layerName,
        layerKind: "pushpin",
        groups,
    };
}
