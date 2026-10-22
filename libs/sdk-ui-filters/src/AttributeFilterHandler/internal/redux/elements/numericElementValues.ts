// (C) 2026 GoodData Corporation

import { type IAttributeElement, type ISeparators } from "@gooddata/sdk-model";

const DEFAULT_SEPARATORS: ISeparators = { thousand: ",", decimal: "." };

/**
 * Removes grouping separators from the integer part of a number, or returns undefined when they do not
 * sit in thousands positions ("1.234" for a dot, but not "1234.5" or "1.23"), so that text which is not
 * grouped, such as a raw value with a dot where the dot groups thousands, is not misread.
 */
function removeGrouping(text: string, thousand: string): string | undefined {
    if (!thousand) {
        return text;
    }

    // a space-like grouping separator (e.g. a non-breaking space) is typed as a plain space too
    const groups = /^\s$/.test(thousand) ? text.split(/\s/) : text.split(thousand);

    if (groups.length === 1) {
        return text;
    }

    const [first, ...rest] = groups;
    const isGrouped = /^\d{1,3}$/.test(first) && rest.every((group) => /^\d{3}$/.test(group));

    return isGrouped ? groups.join("") : undefined;
}

/**
 * Reads text written with the given separators as a number in plain notation, e.g. "1 234,5" with a space
 * for grouping and a decimal comma becomes "1234.5".
 *
 * @remarks
 * Only the separators are understood: grouping separators in thousands positions are dropped and the
 * decimal separator becomes a dot. Anything else a number format may add (units, scaling, percent) makes the text not a number.
 * An unfinished number, such as "12," while typing, is still read ("12.").
 *
 * @param text - text to read
 * @param separators - separators the text is written with; defaults to "," for grouping and "." for decimals
 * @returns the number in plain notation, or undefined when the text is not a number
 * @internal
 */
export function toPlainNumberText(text: string, separators: ISeparators | undefined): string | undefined {
    const thousand = separators?.thousand ?? DEFAULT_SEPARATORS.thousand;
    const decimal = separators?.decimal ?? DEFAULT_SEPARATORS.decimal;
    const trimmed = text.trim();
    const sign = trimmed.startsWith("-") ? "-" : "";
    const unsigned = trimmed.slice(sign.length);
    const [integerPart, fractionPart, ...rest] = decimal ? unsigned.split(decimal) : [unsigned];

    if (rest.length > 0) {
        return undefined;
    }

    const integerDigits = removeGrouping(integerPart, thousand);

    if (integerDigits === undefined) {
        return undefined;
    }

    const isDigitsOnly =
        /^\d*$/.test(integerDigits) && (fractionPart === undefined || /^\d*$/.test(fractionPart));

    if (!isDigitsOnly || !/\d/.test(`${integerDigits}${fractionPart ?? ""}`)) {
        return undefined;
    }

    return fractionPart === undefined ? `${sign}${integerDigits}` : `${sign}${integerDigits}.${fractionPart}`;
}

/**
 * Drops trailing zeros of the decimal part, and the decimal point with them when nothing is left ("1.50"
 * becomes "1.5", "1.0" becomes "1"). An unfinished "12." stays as it is. This only widens a substring match.
 */
function withoutTrailingDecimalZeros(plainNumber: string): string {
    if (!plainNumber.includes(".")) {
        return plainNumber;
    }

    const trimmed = plainNumber.replace(/0+$/, "");

    return trimmed !== plainNumber && trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
}

/**
 * Turns the search a user typed into the search for the raw element values of a number-formatted attribute.
 *
 * @remarks
 * Elements are matched by their raw value, so a number typed with the separators the user reads, such as
 * "1 234,5", is searched as "1234.5". Anything that is not such a number is searched as typed.
 *
 * @param search - search as typed by the user
 * @param numberFormat - number format of the element values; without one the search is kept as typed
 * @param separators - separators the formatted values are displayed with
 * @internal
 */
export function toRawValueSearch(
    search: string,
    numberFormat: string | undefined,
    separators: ISeparators | undefined,
): string {
    if (!numberFormat || !search) {
        return search;
    }

    const plainNumber = toPlainNumberText(search, separators);

    // Raw values carry no padding, so "1 234,50" read from a "#,##0.00" value must find "1234.5".
    return plainNumber === undefined ? search : withoutTrailingDecimalZeros(plainNumber);
}

/**
 * Gets the raw value of a number-formatted element when its displayed value says more than the raw value
 * with separators, e.g. a rounded "1.23" for "1.2349" or a scaled "1.2 K" for "1234". Returns undefined
 * when the displayed value differs only in separators or padding ("1 234,50" for "1234.5"), and for
 * elements without a formatted value.
 *
 * @param element - element of an attribute with a number format
 * @param separators - separators the formatted value is displayed with
 * @internal
 */
export function getNumberFormattedElementRawTitle(
    element: IAttributeElement,
    separators: ISeparators | undefined,
): string | undefined {
    const { title, formattedTitle } = element;

    if (!title || !formattedTitle || formattedTitle === title) {
        return undefined;
    }

    const displayedNumber = toPlainNumberText(formattedTitle, separators);

    return displayedNumber !== undefined && Number(displayedNumber) === Number(title) ? undefined : title;
}
