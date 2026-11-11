// (C) 2025-2026 GoodData Corporation

import { type ITotal } from "@gooddata/sdk-model";
import { _sortBy } from "@gooddata/util";

import { DEFAULT_TOTAL_FUNCTIONS } from "../../constants/internal.js";

/**
 * Orders totals according to the predefined total type order.
 *
 * This ensures that when column and row aggregations meet at intersections,
 * they maintain consistent ordering so that the intersection is displayed correctly.
 * The ordering follows the same pattern as the old pivot table implementation.
 *
 * Ordering may be used when creating totals inside the table
 * or when totals are provided externally.
 *
 * @param totals - Array of totals to order
 * @returns Ordered array of totals
 * @internal
 */
export function orderTotals(totals: ITotal[]): ITotal[] {
    return _sortBy(totals, (total) =>
        DEFAULT_TOTAL_FUNCTIONS.findIndex((rankedItem) => rankedItem === total.type),
    );
}
