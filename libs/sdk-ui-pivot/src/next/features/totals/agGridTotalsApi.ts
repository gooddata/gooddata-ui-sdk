// (C) 2025 GoodData Corporation
import { GridApi } from "ag-grid-enterprise";
import { AgGridRowData } from "../../types/internal.js";

/**
 * @internal
 */
export function agGridSetGrandTotalRows(
    options: { grandTotalRowData: AgGridRowData[] },
    api: GridApi<AgGridRowData>,
) {
    const { grandTotalRowData } = options;
    api.setGridOption("pinnedBottomRowData", grandTotalRowData);
}
