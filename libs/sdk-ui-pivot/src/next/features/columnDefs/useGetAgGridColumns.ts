// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { AgGridApi } from "../../types/agGrid.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";

/**
 * @internal
 */
export function useGetAgGridColumns() {
    const { columns } = usePivotTableProps();
    const isPivoted = columns.length > 0;

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
