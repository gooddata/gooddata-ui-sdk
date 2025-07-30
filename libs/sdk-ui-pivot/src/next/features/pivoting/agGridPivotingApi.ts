// (C) 2025 GoodData Corporation
import { ColDef, ColGroupDef, GridApi } from "ag-grid-enterprise";
import { AgGridRowData } from "../../types/internal.js";

/**
 * @internal
 */
export function agGridSetPivotResultColumns(
    options: { colDefs: (ColDef | ColGroupDef)[] },
    api: GridApi<AgGridRowData>,
) {
    const { colDefs } = options;
    api.setPivotResultColumns(colDefs);
}
