// (C) 2025-2026 GoodData Corporation

import { formatLegendLabel, getRgbFromWebColor, getRgbStringFromRGB } from "@gooddata/sdk-ui-vis-commons";

import { type ILegendColorScaleItem } from "../../types/legend/model.js";

/**
 * Default numeric symbols for legend label formatting.
 *
 * @internal
 */
const DEFAULT_NUMERIC_SYMBOLS = ["k", "M", "G", "T", "P", "E"];

/**
 * Computes color scale item from measure data.
 *
 * @remarks
 * Creates a color scale legend item with min/max labels.
 * Used by both area and pushpin layers for numeric color measures.
 *
 * @param colorData - Array of numeric values for the color measure
 * @param format - Number format string for labels
 * @param numericSymbols - Numeric symbols used for compact formatting (k, M, G, ...)
 * @returns Color scale item with min/max values, or null if data is insufficient
 *
 * @internal
 */
export function computeColorScale(
    colorData: number[],
    format: string,
    numericSymbols?: string[],
    baseColor?: string,
): ILegendColorScaleItem | null {
    const validData = colorData.filter(Number.isFinite);
    if (validData.length === 0) {
        return null;
    }

    const min = Math.min(...validData);
    const max = Math.max(...validData);

    // If all values are the same, don't show a scale
    if (min === max) {
        return null;
    }

    const diff = max - min;
    const symbols = numericSymbols && numericSymbols.length >= 4 ? numericSymbols : DEFAULT_NUMERIC_SYMBOLS;

    const scaleColors = baseColor ? computeScaleColors(baseColor) : null;

    return {
        type: "colorScale",
        minLabel: formatLegendLabel(min, format, diff, symbols),
        maxLabel: formatLegendLabel(max, format, diff, symbols),
        // If we can derive colors from the resolved base color, do it so legend matches the map.
        // Otherwise the UI falls back to theme-driven gradient.
        minColor: scaleColors?.minColor ?? "",
        maxColor: scaleColors?.maxColor ?? "",
    };
}

function computeScaleColors(baseColor: string): { minColor: string; maxColor: string } | null {
    const rgb = getRgbFromWebColor(baseColor);
    if (!rgb) {
        return null;
    }

    // Match the lightest step from the geo palette generator:
    // step = (255 - channel) / 6, lightest = channel + 5 * step => channel + (255 - channel) * 5/6
    const lightenFactor = 5 / 6;
    const minColor = getRgbStringFromRGB({
        r: lightenChannel(rgb.r, lightenFactor),
        g: lightenChannel(rgb.g, lightenFactor),
        b: lightenChannel(rgb.b, lightenFactor),
    });

    return { minColor, maxColor: getRgbStringFromRGB(rgb) };
}

function lightenChannel(channel: number, factor: number): number {
    return clampByte(Math.round(channel + (255 - channel) * factor));
}

function clampByte(value: number): number {
    return Math.min(255, Math.max(0, value));
}
