// (C) 2026 GoodData Corporation

import { type IAttributeElement, type ISeparators } from "@gooddata/sdk-model";
import { type ValueFormatter, createNumberFormatter, formatAttributeValue } from "@gooddata/sdk-ui";

/**
 * Gives an element of a numeric computed attribute a formatted title, the same way measure values are
 * formatted. Elements that already have a formatted title (dates) and titles that are not numbers are
 * returned unchanged; the raw title and the uri always stay as they are.
 */
function formatElementTitle(
    element: IAttributeElement,
    numberFormat: string,
    formatter: ValueFormatter,
): IAttributeElement {
    const { title, formattedTitle } = element;

    if (formattedTitle !== undefined) {
        return element;
    }

    const formatted = formatAttributeValue(title, numberFormat, formatter);

    return formatted === null || formatted === title ? element : { ...element, formattedTitle: formatted };
}

/**
 * Gives the cached elements, keyed by element key, a formatted title according to the number format of
 * their values.
 *
 * @remarks
 * Returns the very same map when nothing gets formatted, so that nothing downstream sees a new reference
 * for an unchanged cache.
 *
 * @internal
 */
export function formatElementTitlesMap(
    elements: Record<string, IAttributeElement>,
    numberFormat: string | undefined,
    separators: ISeparators | undefined,
): Record<string, IAttributeElement> {
    if (!numberFormat) {
        return elements;
    }

    const formatter = createNumberFormatter(separators);
    const entries = Object.entries(elements);
    const formatted = entries.map(
        ([key, element]) => [key, formatElementTitle(element, numberFormat, formatter)] as const,
    );

    return formatted.every(([, element], index) => element === entries[index][1])
        ? elements
        : Object.fromEntries(formatted);
}
