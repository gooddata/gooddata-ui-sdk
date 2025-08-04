// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { AgGridApi } from "../../types/agGrid.js";
import { useColumnDefs } from "../../context/ColumnDefsContext.js";

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
