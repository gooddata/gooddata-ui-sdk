// (C) 2025-2026 GoodData Corporation

import { escape, unescape } from "lodash-es";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { type ISeparators } from "@gooddata/sdk-model";

/**
 * Formatting functions for GeoPushpinChart tooltips
 *
 * @internal
 */

/**
 * Custom escape function that first unescapes then escapes a string
 *
 * @remarks
 * Ensures consistent escaping by removing any existing escape sequences first
 */
const customEscape = (str: string) => str && escape(unescape(str));

/**
 * Formats a value for display in tooltips
 *
 * @remarks
 * Uses GoodData's number formatter to format values according to the provided format string.
 * The formatted value is escaped for safe HTML rendering.
 *
 * @param val - Value to format (string or number)
 * @param format - Format string (e.g., "#,##0.00")
 * @param separators - Optional separators configuration for thousands and decimals
 * @returns Formatted and escaped string
 *
 * @internal
 */
export function formatValueForTooltip(
    val: string | number,
    format: string | undefined,
    separators?: ISeparators,
): string {
    if (!format) {
        return `${val}`;
    }

    const convertedValue = ClientFormatterFacade.convertValue(val);
    const { formattedValue } = ClientFormatterFacade.formatValue(convertedValue, format, separators);

    return customEscape(formattedValue);
}

/**
 * Calculates tooltip content width based on chart dimensions
 *
 * @param isFullScreenTooltip - Whether tooltip should take full width
 * @param chartWidth - Width of the chart container
 * @param tooltipMaxWidth - Maximum allowed tooltip width
 * @returns Calculated tooltip width
 *
 * @internal
 */
export function getTooltipContentWidth(
    isFullScreenTooltip: boolean,
    chartWidth: number,
    tooltipMaxWidth: number,
): number {
    return isFullScreenTooltip ? chartWidth : Math.min(chartWidth, tooltipMaxWidth);
}
