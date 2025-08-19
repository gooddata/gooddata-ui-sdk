// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { agGridSetColumnDefs } from "../../features/columns/agGridColDefsApi.js";
import { agGridSetPivotResultColumns } from "../../features/pivoting/agGridPivotingApi.js";
import { columnDefsToPivotGroups } from "../../features/pivoting/columnDefsToPivotGroups.js";
import { AgGridApi, AgGridColumnDef } from "../../types/agGrid.js";

/**
 * Updates column defs in ag-grid, by updated column defs (use this only if you are working with flat column defs).
 *
 * @internal
 */
export function useUpdateAgGridColumnDefs() {
    const { config } = usePivotTableProps();
    const { isPivoted } = useColumnDefs();
    const { columnHeadersPosition } = config;

    return useCallback(
        (updatedColDefs: AgGridColumnDef[], gridApi: AgGridApi) => {
            if (isPivoted) {
                const groupedColumnDefs = columnDefsToPivotGroups(updatedColDefs, columnHeadersPosition);
                agGridSetPivotResultColumns(
                    {
                        colDefs: groupedColumnDefs,
                    },
                    gridApi,
                );
            } else {
                agGridSetColumnDefs({ colDefs: updatedColDefs }, gridApi);
            }
        },
        [isPivoted, columnHeadersPosition],
    );
}
