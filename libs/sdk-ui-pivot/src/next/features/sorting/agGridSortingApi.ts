// (C) 2025-2026 GoodData Corporation

import { type ColDef, type ColGroupDef, type SortModelItem } from "ag-grid-enterprise";

import { type AgGridApi, isColGroupDef } from "../../types/agGrid.js";

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
        colId: col.colId,
        sort: col.sort!,
    }));
}

/**
 * Applies sort model to column definitions (recursively for groups).
 * Use this when you need to inject sort state into colDefs before column creation.
 *
 * @internal
 */
export function applySortModelToColDefs(
    colDefs: (ColDef | ColGroupDef)[],
    sortModel: SortModelItem[],
): (ColDef | ColGroupDef)[] {
    return colDefs.map((colDef) => {
        if (isColGroupDef(colDef)) {
            return { ...colDef, children: applySortModelToColDefs(colDef.children, sortModel) };
        }

        const sortItem = sortModel.find((s) => s.colId === colDef.colId);
        if (!sortItem) {
            return colDef;
        }

        return { ...colDef, sort: sortItem.sort, sortIndex: sortModel.indexOf(sortItem) };
    });
}
