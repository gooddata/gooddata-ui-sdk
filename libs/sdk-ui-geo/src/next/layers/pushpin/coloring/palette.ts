// (C) 2025 GoodData Corporation

import { isEmpty, range } from "lodash-es";

import { type IRgbColorValue, isAttributeDescriptor, isResultAttributeHeader } from "@gooddata/sdk-model";
import { type IColorLegendItem, type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { type IPushpinColor } from "../../../types/geoData/pushpin.js";
import { isFiniteNumber } from "../../../utils/guards.js";
import {
    DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
    DEFAULT_PUSHPIN_COLOR_OPACITY,
    DEFAULT_PUSHPIN_COLOR_SCALE,
} from "../constants.js";
import { getMinMax } from "../size/calculations.js";

/**
 * Color palette functions for GeoPushpinChartNext
 *
 * @internal
 */

const DEFAULT_SEGMENT_ITEM = "default_segment_item";
const DEFAULT_COLOR_INDEX_IN_PALETTE = DEFAULT_PUSHPIN_COLOR_SCALE - 1;

/**
 * Formats RGB color values into CSS color string
 */
function formatColor(red: number, green: number, blue: number, opacity = 1): string {
    if (opacity === 1) {
        return `rgb(${red},${green},${blue})`;
    }
    return `rgba(${red},${green},${blue},${opacity})`;
}

/**
 * Parses RGB color string into component values
 */
function parseRGBColorCode(color: string): { R: number; G: number; B: number } {
    const parts = color.split(",");
    const R = parseInt(parts[0].slice(4), 10);
    const G = parseInt(parts[1], 10);
    const B = parseInt(parts[2], 10);
    return { R, G, B };
}

/**
 * Calculates a color channel value for a gradient step
 */
function getCalculatedChannel(channel: number, index: number, step: number): number {
    return Math.trunc(channel + index * step);
}

/**
 * Generates an array of gradient colors
 */
function getCalculatedColors(count: number, channels: number[], steps: number[], opacity = 1): string[] {
    return range(1, count).map((index: number): string =>
        formatColor(
            getCalculatedChannel(channels[0], index, steps[0]),
            getCalculatedChannel(channels[1], index, steps[1]),
            getCalculatedChannel(channels[2], index, steps[2]),
            opacity,
        ),
    );
}

/**
 * Converts color to RGB color code object
 */
function getRGBColorCode(color: string | IRgbColorValue): IRgbColorValue {
    if (typeof color === "string") {
        const { R: r, G: g, B: b } = parseRGBColorCode(color);
        return { r, g, b };
    }
    return color;
}

/**
 * Generates a color palette from a base color
 *
 * @remarks
 * Creates a gradient palette with lighter shades, useful for color scales
 *
 * @param baseColor - Base color as RGB string or object
 * @param opacity - Opacity value (0-1)
 * @returns Array of color strings from light to dark
 *
 * @internal
 */
export function getColorPalette(baseColor: string | IRgbColorValue, opacity = 1): string[] {
    const colorItemsCount = 6;
    const { r, g, b } = getRGBColorCode(baseColor);
    const channels = [r, g, b];
    const steps = channels.map((channel) => (255 - channel) / colorItemsCount);
    const generatedColors = getCalculatedColors(colorItemsCount, channels, steps, opacity);
    return [...generatedColors.reverse(), formatColor(r, g, b, opacity)];
}

/**
 * Converts RGB color to RGBA with opacity
 *
 * @param color - RGB color string
 * @param opacity - Opacity value (0-1)
 * @returns RGBA color string
 *
 * @internal
 */
export function rgbToRgba(color: string, opacity = 1): string {
    const { R, G, B } = parseRGBColorCode(color);
    return formatColor(R, G, B, opacity);
}

/**
 * Gets the color palette index for a given value
 *
 * @param value - Value to map to palette
 * @param min - Minimum value in range
 * @param max - Maximum value in range
 * @returns Index in the color palette (0 to DEFAULT_PUSHPIN_COLOR_SCALE - 1)
 *
 * @internal
 */
export function getColorIndexInPalette(value: number | null, min: number, max: number): number {
    if (value === null || !Number.isFinite(value) || min === max || value === min) {
        return 0;
    }

    if (value === max) {
        return DEFAULT_COLOR_INDEX_IN_PALETTE;
    }

    const step = (max - min) / DEFAULT_PUSHPIN_COLOR_SCALE;
    for (let i = 0, offset = min; i < DEFAULT_PUSHPIN_COLOR_SCALE; i++, offset += step) {
        if (offset >= value) {
            return i;
        }
    }

    return DEFAULT_COLOR_INDEX_IN_PALETTE;
}

/**
 * Type for color palette mapping by segment name
 */
type ColorPaletteMapping = { [itemName: string]: string[] };

/**
 * Creates a mapping of segment names to color palettes
 *
 * @param colorStrategy - Color strategy from visualization
 * @returns Map of segment names to color palettes
 *
 * @internal
 */
export function getColorPaletteMapping(colorStrategy: IColorStrategy): ColorPaletteMapping {
    const colorAssignment = colorStrategy.getColorAssignment();

    return colorAssignment.reduce((result: ColorPaletteMapping, item, index): ColorPaletteMapping => {
        const color = colorStrategy.getColorByIndex(index);
        const colorPalette = getColorPalette(color, DEFAULT_PUSHPIN_COLOR_OPACITY);

        // Color based on Location
        if (isAttributeDescriptor(item.headerItem)) {
            return {
                [DEFAULT_SEGMENT_ITEM]: colorPalette,
            };
        }

        // Color based on SegmentBy
        const name = isResultAttributeHeader(item.headerItem)
            ? item.headerItem.attributeHeaderItem.name
            : DEFAULT_SEGMENT_ITEM;

        result[name ?? DEFAULT_SEGMENT_ITEM] = colorPalette;
        return result;
    }, {});
}

/**
 * Generates pushpin colors based on color and segment values
 *
 * @remarks
 * Determines border and background colors for each pushpin based on:
 * - Color measure values
 * - Segment values
 * - Color strategy
 *
 * @param colorValues - Array of color measure values (can be null)
 * @param segmentValues - Array of segment names
 * @param colorStrategy - Color strategy for palette generation
 * @returns Array of pushpin color configurations
 *
 * @internal
 */
export function getPushpinColors(
    colorValues: ReadonlyArray<number | null>,
    segmentValues: string[] = [],
    colorStrategy: IColorStrategy,
): IPushpinColor[] {
    const defaultColorValue = colorStrategy.getColorByIndex(0);
    const defaultColor = rgbToRgba(defaultColorValue, DEFAULT_PUSHPIN_COLOR_OPACITY);

    // No color or segment data - use default
    if (colorValues.length === 0 && segmentValues.length === 0) {
        return [
            {
                border: DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
                background: defaultColor,
            },
        ];
    }

    const segmentNames: string[] = [...segmentValues];
    const colorPaletteMapping: ColorPaletteMapping = getColorPaletteMapping(colorStrategy);
    const fallbackPalette =
        colorPaletteMapping[DEFAULT_SEGMENT_ITEM] ??
        getColorPalette(defaultColorValue, DEFAULT_PUSHPIN_COLOR_OPACITY);

    // Only segment data, no color measure
    if (colorValues.length === 0) {
        return segmentNames.map((name: string): IPushpinColor => {
            const palette = colorPaletteMapping[name] ?? fallbackPalette;
            return {
                border: DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
                background: palette?.[DEFAULT_COLOR_INDEX_IN_PALETTE] ?? defaultColor,
            };
        });
    }

    // Calculate min/max for color scale
    const colorsWithoutNull = colorValues.filter((value): value is number => isFiniteNumber(value));
    const { min, max } = getMinMax(colorsWithoutNull);
    const safeMin = min ?? 0;
    const safeMax = max ?? safeMin;

    // All values are the same and no segments - use default
    if (safeMin === safeMax && segmentValues.length === 0) {
        return [
            {
                border: DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
                background: defaultColor,
            },
        ];
    }

    // Generate colors for each data point
    return colorValues.map((color: number | null, index: number): IPushpinColor => {
        const value = color !== null && isFiniteNumber(color) ? color : safeMin;
        const colorIndex = getColorIndexInPalette(value, safeMin, safeMax);
        const segmentItemName = segmentNames[index] || DEFAULT_SEGMENT_ITEM;
        const palette = colorPaletteMapping[segmentItemName] ?? fallbackPalette;
        const borderColor =
            palette?.[DEFAULT_COLOR_INDEX_IN_PALETTE] ?? fallbackPalette[DEFAULT_COLOR_INDEX_IN_PALETTE];
        const backgroundColor = palette?.[colorIndex] ?? fallbackPalette[colorIndex] ?? defaultColor;

        return {
            border: borderColor ?? DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
            background: backgroundColor,
        };
    });
}

/**
 * Generates legend color data for a color measure
 *
 * @param colorSeries - Array of color values
 * @param colorString - Base color as string
 * @returns Array of color legend items with ranges
 *
 * @internal
 */
export function generateLegendColorData(colorSeries: number[], colorString: string): IColorLegendItem[] {
    if (isEmpty(colorSeries)) {
        return [];
    }

    const colorPalette = getColorPalette(colorString, DEFAULT_PUSHPIN_COLOR_OPACITY);
    const min = Math.min(...colorSeries);
    const max = Math.max(...colorSeries);
    const offset = (max - min) / DEFAULT_PUSHPIN_COLOR_SCALE;

    if (min === max) {
        return [];
    }

    return range(0, DEFAULT_PUSHPIN_COLOR_SCALE).map((index: number): IColorLegendItem => {
        const from = min + offset * index;
        const isLastItem = index === DEFAULT_PUSHPIN_COLOR_SCALE - 1;
        const to = isLastItem ? max : from + offset;

        return {
            range: { from, to },
            color: colorPalette[index],
        };
    });
}
