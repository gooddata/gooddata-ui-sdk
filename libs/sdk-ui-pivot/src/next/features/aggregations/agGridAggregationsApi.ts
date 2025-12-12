// (C) 2025 GoodData Corporation

import { type GridApi } from "ag-grid-enterprise";

import { type GrandTotalsPosition } from "../../types/grandTotalsPosition.js";
import { type AgGridRowData } from "../../types/internal.js";

/**
 * Set grand total rows to the ag-grid.
 *
 * @param options - Configuration including grand total row data and position
 * @param api - AG Grid API instance
 *
 * @internal
 */
export function agGridSetGrandTotalRows(
    options: { grandTotalRowData: AgGridRowData[]; grandTotalsPosition?: GrandTotalsPosition },
    api: GridApi<AgGridRowData>,
) {
    const { grandTotalRowData, grandTotalsPosition = "pinnedBottom" } = options;

    // Clear both pinned row areas first
    if (grandTotalRowData.length === 0) {
        api.setGridOption("pinnedTopRowData", []);
        api.setGridOption("pinnedBottomRowData", []);
        return;
    }

    // Set grand totals based on position
    if (grandTotalsPosition === "pinnedTop") {
        api.setGridOption("pinnedTopRowData", grandTotalRowData);
        api.setGridOption("pinnedBottomRowData", []);
    } else if (grandTotalsPosition === "pinnedBottom") {
        api.setGridOption("pinnedTopRowData", []);
        api.setGridOption("pinnedBottomRowData", grandTotalRowData);
    } else {
        // For non-pinned positions (top/bottom), data is in rowData, so clear pinned areas
        api.setGridOption("pinnedTopRowData", []);
        api.setGridOption("pinnedBottomRowData", []);
    }
}
