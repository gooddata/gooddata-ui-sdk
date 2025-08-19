// (C) 2025 GoodData Corporation
import { SortModelItem } from "ag-grid-enterprise";

import { AgGridApi } from "../../types/agGrid.js";

/**
 * Get the current sort model from the grid API
 *
 * @alpha
 */
export function getSortModel(gridApi: AgGridApi): SortModelItem[] {
    return gridApi
        .getColumnState()
        .filter((col) => col.sort !== null)
        .map((col) => ({
            colId: col.colId!,
            sort: col.sort!,
        }));
}
