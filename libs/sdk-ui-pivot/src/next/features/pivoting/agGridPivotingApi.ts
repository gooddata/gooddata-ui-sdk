// (C) 2025 GoodData Corporation
import { ColDef, ColGroupDef, GridApi } from "ag-grid-enterprise";
import { AgGridRowData } from "../../types/internal.js";

/**
 * Sets pivot result columns to the ag-grid.
 *
 * @internal
 */
export function agGridSetPivotResultColumns(
    options: { colDefs: (ColDef | ColGroupDef)[] },
    api: GridApi<AgGridRowData>,
) {
    const { colDefs } = options;
    // Avoid duplicit colDefs in sort-model.
    api.setGridOption("columnDefs", []);
    api.setPivotResultColumns(colDefs);
}
