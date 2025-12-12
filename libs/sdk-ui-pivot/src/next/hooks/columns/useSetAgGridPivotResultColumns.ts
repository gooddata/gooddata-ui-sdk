// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { agGridSetPivotResultColumns } from "../../features/pivoting/agGridPivotingApi.js";
import { type AgGridApi } from "../../types/agGrid.js";

/**
 * Hook to update ag-grid pivot result columns.
 *
 * @internal
 */
export function useSetAgGridPivotResultColumns() {
    const { columnDefs, isPivoted } = useColumnDefs();

    const setPivotResultColumns = useCallback(
        (gridApi: AgGridApi) => {
            if (isPivoted) {
                agGridSetPivotResultColumns({ colDefs: columnDefs }, gridApi);
            }
        },
        [isPivoted, columnDefs],
    );

    return {
        setPivotResultColumns,
    };
}
