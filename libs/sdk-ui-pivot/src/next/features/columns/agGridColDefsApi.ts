// (C) 2025 GoodData Corporation
import { type AgGridApi, type AgGridColumnDef, type AgGridColumnGroupDef } from "../../types/agGrid.js";

/**
 * Updates column defs in ag-grid.
 
 * @internal
 */
export function agGridSetColumnDefs(
    options: { colDefs: (AgGridColumnDef | AgGridColumnGroupDef)[] },
    api: AgGridApi,
) {
    const { colDefs } = options;
    api.setGridOption("columnDefs", colDefs);
}
