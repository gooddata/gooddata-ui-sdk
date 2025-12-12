// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { type AgGridApi } from "../../types/agGrid.js";

/**
 * Returns current ag-grid columns.
 *
 * @internal
 */
export function useGetAgGridColumns() {
    const { isPivoted } = useColumnDefs();

    return useCallback(
        (gridApi: AgGridApi) => {
            if (isPivoted) {
                return gridApi.getPivotResultColumns();
            } else {
                return gridApi.getColumns();
            }
        },
        [isPivoted],
    );
}
