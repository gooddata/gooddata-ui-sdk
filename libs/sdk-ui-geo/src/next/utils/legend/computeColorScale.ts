// (C) 2025-2026 GoodData Corporation

import { formatLegendLabel } from "@gooddata/sdk-ui-vis-commons";

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

    return {
        type: "colorScale",
        minLabel: formatLegendLabel(min, format, diff, symbols),
        maxLabel: formatLegendLabel(max, format, diff, symbols),
        // Colors will be determined by the UI component based on theme
        minColor: "",
        maxColor: "",
    };
}
