// (C) 2025-2026 GoodData Corporation

import { type ColDef, type ColGroupDef, type GridApi } from "ag-grid-enterprise";

import { type AgGridRowData } from "../../types/internal.js";
import { applySortModelToColDefs, getSortModel } from "../sorting/agGridSortingApi.js";

/**
 * Sets pivot result columns to the ag-grid, preserving current sort state.
 *
 * @internal
 */
export function agGridSetPivotResultColumns(
    options: { colDefs: (ColDef | ColGroupDef)[] },
    api: GridApi<AgGridRowData>,
) {
    const { colDefs } = options;

    // Capture current sort state using existing utility
    const sortModel = getSortModel(api);

    // Only apply sort preservation if there's existing sort.
    // On initial load, use original colDefs which already have sort from column builders.
    const effectiveColDefs = sortModel.length > 0 ? applySortModelToColDefs(colDefs, sortModel) : colDefs;

    // Avoid duplicate colDefs in sort-model.
    api.setGridOption("columnDefs", []);
    api.setPivotResultColumns(effectiveColDefs);
}
