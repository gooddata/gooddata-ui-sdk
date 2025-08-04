// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { AgGridRowData } from "../types/internal.js";
import { agGridSetGrandTotalRows } from "../features/aggregations/agGridAggregationsApi.js";
import { AgGridApi } from "../types/agGrid.js";

/**
 * Hook to apply grand total rows to ag-grid.
 *
 * @internal
 */
export function useGrandTotalRows() {
    const setGrandTotalRows = useCallback((gridApi: AgGridApi, grandTotalRowData: AgGridRowData[]) => {
        agGridSetGrandTotalRows({ grandTotalRowData }, gridApi);
    }, []);

    return {
        setGrandTotalRows,
    };
}
