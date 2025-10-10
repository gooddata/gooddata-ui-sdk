// (C) 2025 GoodData Corporation

import { ITableColumnDefinition } from "@gooddata/sdk-ui";

/**
 * Determines if cell text wrapping should be allowed for a given column.
 *
 * @remarks
 * This function implements a performance optimization by disabling cell text wrapping for
 * numeric columns. Numeric values in columns typically don't benefit from
 * text wrapping the same way attribute text values do.
 *
 * Cell wrapping is ALLOWED (returns true) for:
 * - Attribute columns - contain text values that may benefit from wrapping
 * - Measure group header columns - contain measure names (text)
 *
 * Cell wrapping is DISABLED (returns false) for:
 * - Value columns - contain numeric measure values
 * - Subtotal columns - contain numeric subtotal values
 * - Grand total columns - contain numeric grand total values
 * - Measure group value columns - contain numeric values
 *
 * Note: This only affects cell wrapping (wrapText), not header wrapping (wrapHeaderText).
 * Headers can still wrap even when cell wrapping is disabled.
 *
 * @param columnDefinition - The column definition to check
 * @returns true if cell wrapping should be allowed, false if it should be disabled for performance
 *
 * @internal
 */
export function allowCellWrappingByColumnDefinition(columnDefinition: ITableColumnDefinition): boolean {
    switch (columnDefinition.type) {
        // text values that need wrapping
        case "attribute":
        case "measureGroupHeader":
            return true;

        // values that should not be wrapped
        case "value":
        case "subtotal":
        case "grandTotal":
        case "measureGroupValue":
            return false;

        default:
            return false;
    }
}
