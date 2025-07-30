// (C) 2025 GoodData Corporation
import { AgGridApi, AgGridColumnDef, AgGridColumnGroupDef } from "../../types/agGrid.js";

/**
 * @internal
 */
export function agGridSetColumnDefs(
    options: { colDefs: (AgGridColumnDef | AgGridColumnGroupDef)[] },
    api: AgGridApi,
) {
    const { colDefs } = options;
    api.setGridOption("columnDefs", colDefs);
}
