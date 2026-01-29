// (C) 2025-2026 GoodData Corporation

import { type ISeparators } from "@gooddata/sdk-model";

/**
 * Default separators for number formatting (US locale: comma for thousands, period for decimal).
 *
 * @internal
 */
export const DEFAULT_SEPARATORS: ISeparators = {
    thousand: ",",
    decimal: ".",
};

/**
 * Formats a number with the given thousand and decimal separators.
 *
 * @param value - The number to format (null/undefined returns empty string)
 * @param separators - Thousand and decimal separators to use
 * @returns Formatted string with separators applied
 *
 * @internal
 */
export function formatNumberWithSeparators(
    value: number | null | undefined,
    separators: ISeparators = DEFAULT_SEPARATORS,
): string {
    if (value === null || value === undefined) {
        return "";
    }

    const stringValue = String(value);
    const [integerPart, decimalPart] = stringValue.split(".");

    // Add a thousand separators to the integer part
    const formattedInteger = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${separators.thousand}`);

    return decimalPart === undefined
        ? formattedInteger
        : `${formattedInteger}${separators.decimal}${decimalPart}`;
}

/**
 * Shortens large numbers with K/M/B suffixes for compact display.
 * Only shortens numbers that are evenly divisible by 100 at their scale.
 *
 * @param value - The number to shorten (null/undefined returns empty string)
 * @param separators - Thousand and decimal separators to use
 * @returns Shortened string with K/M/B suffix or full formatted number
 *
 * @example
 * ```
 * shortenNumber(1000, { thousand: ',', decimal: '.' })      // "1K"
 * shortenNumber(1500, { thousand: ',', decimal: '.' })      // "1,500" (not evenly divisible)
 * shortenNumber(2500000, { thousand: ',', decimal: '.' })   // "2.5M"
 * shortenNumber(1000000000, { thousand: ',', decimal: '.' }) // "1B"
 * ```
 *
 * @internal
 */
export function shortenNumber(
    value: number | null | undefined,
    separators: ISeparators = DEFAULT_SEPARATORS,
): string {
    if (value === null || value === undefined) {
        return "";
    }

    if (Math.abs(value) >= 1000000000 && value % 100000000 === 0) {
        return `${formatNumberWithSeparators(value / 1000000000, separators)}B`;
    } else if (Math.abs(value) >= 1000000 && value % 100000 === 0) {
        return `${formatNumberWithSeparators(value / 1000000, separators)}M`;
    } else if (Math.abs(value) >= 1000 && value % 100 === 0) {
        return `${formatNumberWithSeparators(value / 1000, separators)}K`;
    }

    return formatNumberWithSeparators(value, separators);
}
