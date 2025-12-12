// (C) 2025 GoodData Corporation

import { isEqual } from "lodash-es";

import { type IColumnTextWrappingItem } from "../../types/textWrapping.js";

/**
 * Checks if two {@link IColumnTextWrappingItem}s match (have the same locators).
 *
 * @remarks
 * Two text wrapping items match if they have identical locator arrays.
 * This means they target the same column(s) in the pivot table.
 * The actual wrapping settings (wrapText, wrapHeaderText) are not compared.
 *
 * @internal
 */
export function isColumnTextWrappingItemMatch(
    item1: IColumnTextWrappingItem,
    item2: IColumnTextWrappingItem,
): boolean {
    // Deep equality check on locator arrays
    // Locators must match exactly in order and content
    return isEqual(item1.locators, item2.locators);
}
