// (C) 2025 GoodData Corporation

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
