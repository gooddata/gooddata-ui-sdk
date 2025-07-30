// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { agGridSetColumnDefs } from "./agGridColumnDefsApi.js";
import { AgGridApi, AgGridColumnDef } from "../../types/agGrid.js";
import { agGridSetPivotResultColumns } from "../pivoting/agGridPivotingApi.js";
import { columnDefsToPivotGroups } from "../pivoting/columnDefsToPivotGroups.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";

/**
 * @internal
 */
export function useUpdateAgGridColumnDefs() {
    const { config, columns } = usePivotTableProps();
    const { columnHeadersPosition, measureGroupDimension } = config;
    const isTransposed = measureGroupDimension === "rows";
    const isPivoted = columns.length > 0;

    return useCallback(
        (updatedColDefs: AgGridColumnDef[], gridApi: AgGridApi) => {
            if (isPivoted) {
                const groupedColumnDefs = columnDefsToPivotGroups(
                    updatedColDefs,
                    isTransposed,
                    columnHeadersPosition,
                );
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
        [isPivoted, columnHeadersPosition, isTransposed],
    );
}
