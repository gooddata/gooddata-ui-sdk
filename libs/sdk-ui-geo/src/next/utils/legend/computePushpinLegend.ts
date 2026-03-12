// (C) 2025-2026 GoodData Corporation

import { formatLegendLabel } from "@gooddata/sdk-ui-vis-commons";

import { computeColorScale } from "./computeColorScale.js";
import {
    ATTRIBUTE_ONLY_URI_PREFIX,
    FALLBACK_LEGEND_COLOR,
    SEGMENTED_COLOR_SCALE_MAX_COLOR,
    SEGMENTED_COLOR_SCALE_MIN_COLOR,
    convertToColorCategories,
    isAttributeOnlyPushpinData,
} from "./legendUtils.js";
import type { IAvailableLegends, IGeoLegendItem } from "../../types/common/legends.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import {
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
 * Attribute-only layers render a non-interactive color group with the configured layer color.
 * Returns null when there are no legend groups to display.
 *
 * @param params - Parameters for computation
 * @returns Legend section for the pushpin layer, or null if no legend data
 *
 * @internal
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
    const hasCategoryLegend = availableLegends.hasCategoryLegend && legendItems.length > 0;

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

    // Add category legend group if available (Segment By)
    if (hasCategoryLegend) {
        const colorCategories = convertToColorCategories(legendItems);
        groups.push({
            kind: "color",
            title: geoData.segment?.name ?? "Color",
            items: colorCategories,
        });
    }

    // Add numeric color scale group if available.
    // When segment categories are present, keep the scale and render it as a neutral grayscale
    // so the legend explains the metric range without implying a per-segment color ramp.
    // Order: Size -> Segment By -> Metric-Color
    if (availableLegends.hasColorLegend && geoData.color) {
        const colorScale = computeColorScale(
            geoData.color.data,
            geoData.color.format,
            numericSymbols,
            hasCategoryLegend ? undefined : colorScaleBaseColor,
        );
        if (colorScale) {
            groups.push({
                kind: "colorScale",
                title: geoData.color.name,
                titleMessageId: hasCategoryLegend
                    ? "geochart.legend.colorScale.title.allSegments"
                    : undefined,
                titleMessageValues: hasCategoryLegend ? { metric: geoData.color.name } : undefined,
                items: [
                    {
                        ...colorScale,
                        minColor: hasCategoryLegend ? SEGMENTED_COLOR_SCALE_MIN_COLOR : colorScale.minColor,
                        maxColor: hasCategoryLegend ? SEGMENTED_COLOR_SCALE_MAX_COLOR : colorScale.maxColor,
                    },
                ],
            });
        }
    }

    // Attribute-only fallback is mutually exclusive with category/color/size groups above:
    // isAttributeOnlyPushpinData requires !segment && !color && !size, which prevents those branches.
    const hasAttributeOnlyLegend = isAttributeOnlyPushpinData(geoData);
    if (hasAttributeOnlyLegend) {
        const attributeName = geoData.location?.name ?? "Location";
        groups.push({
            kind: "color",
            title: "",
            items: [
                {
                    type: "colorCategory",
                    label: attributeName,
                    color: colorScaleBaseColor ?? FALLBACK_LEGEND_COLOR,
                    uri: `${ATTRIBUTE_ONLY_URI_PREFIX}:${layerId}`,
                    isVisible: true,
                },
            ],
            isInteractive: false,
        });
    }

    // Return null when there are no legend groups
    if (groups.length === 0) {
        return null;
    }

    return {
        layerId,
        layerTitle: layerName,
        layerKind: "pushpin",
        groups,
        isAttributeOnlySection: hasAttributeOnlyLegend,
    };
}
