// (C) 2025 GoodData Corporation
import { type GridApi } from "ag-grid-enterprise";

import { type AgGridRowData } from "../../types/internal.js";

/**
 * Sets global loading state for ag-grid.
 *
 * @internal
 */
export function agGridSetLoading(options: { isLoading: boolean }, api: GridApi<AgGridRowData>) {
    const { isLoading } = options;
    api.setGridOption("loading", isLoading);
}
