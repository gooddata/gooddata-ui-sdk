// (C) 2025 GoodData Corporation

import { Column } from "ag-grid-enterprise";

/**
 * Gets the next sort state for a column
 *
 * @param column - The AgGrid column to get the next sort state for
 * @returns The next sort state: "desc", "asc", or null
 * @internal
 */
export function getNextSortState(column: Column): "desc" | "asc" | null {
    const currentSort = column.getSort();
    const colDef = column.getColDef();

    const sortingOrder = colDef.sortingOrder || ["desc", "asc", null];

    const currentIndex = sortingOrder.findIndex((order) => order === currentSort);

    // Get next index (cycle back to 0 if at the end)
    const nextIndex = (currentIndex + 1) % sortingOrder.length;

    return sortingOrder[nextIndex] as "desc" | "asc" | null;
}
