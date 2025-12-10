// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useAccessibilityConfigOverrides } from "./useAccessibilityProps.js";
import { agGridSetGrandTotalRows } from "../features/aggregations/agGridAggregationsApi.js";
import { AgGridApi } from "../types/agGrid.js";
import { AgGridRowData } from "../types/internal.js";

/**
 * Hook to apply grand total rows to ag-grid.
 *
 * @remarks
 * When accessibility mode is enabled, grand totals position is automatically
 * adjusted to non-pinned positions for proper screen reader reading order.
 *
 * @internal
 */
export function useGrandTotalRows() {
    const { grandTotalsPosition } = useAccessibilityConfigOverrides();

    const setGrandTotalRows = useCallback(
        (gridApi: AgGridApi, grandTotalRowData: AgGridRowData[]) => {
            agGridSetGrandTotalRows({ grandTotalRowData, grandTotalsPosition }, gridApi);
        },
        [grandTotalsPosition],
    );

    return {
        setGrandTotalRows,
        grandTotalsPosition,
    };
}
