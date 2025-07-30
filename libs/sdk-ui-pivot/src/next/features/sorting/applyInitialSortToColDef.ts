// (C) 2025 GoodData Corporation
import { ISortItem, sortDirection } from "@gooddata/sdk-model";
import { AgGridColumnDef } from "../../types/agGrid.js";

/**
 * @internal
 */
export function applyInitialSortToColDef(colDef: AgGridColumnDef, sortItem: ISortItem): AgGridColumnDef {
    return {
        ...colDef,
        sort: sortDirection(sortItem),
    };
}
