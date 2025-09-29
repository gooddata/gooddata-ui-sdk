// (C) 2025 GoodData Corporation

import { SortModelItem } from "ag-grid-enterprise";

import { AgGridApi } from "../../types/agGrid.js";

/**
 * Get the current sort model from the grid API
 *
 * @alpha
 */
export function getSortModel(gridApi: AgGridApi): SortModelItem[] {
    const sortedColumns = gridApi.getColumnState().filter((col) => col.sort !== null);

    // Check if any column has sortIndex to preserve multi-sort order
    const hasSortIndex = sortedColumns.some((col) => col.sortIndex !== null);

    if (hasSortIndex) {
        // Sort by sortIndex to preserve the order of multi-sort
        sortedColumns.sort((a, b) => {
            const aIndex = a.sortIndex ?? Number.MAX_SAFE_INTEGER;
            const bIndex = b.sortIndex ?? Number.MAX_SAFE_INTEGER;
            return aIndex - bIndex;
        });
    }

    return sortedColumns.map((col) => ({
        colId: col.colId!,
        sort: col.sort!,
    }));
}
