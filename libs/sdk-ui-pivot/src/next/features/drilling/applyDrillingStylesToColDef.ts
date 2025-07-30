// (C) 2025 GoodData Corporation
import { DataViewFacade, ExplicitDrill } from "@gooddata/sdk-ui";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { getCellClassName } from "../styling/cell.js";

/**
 * @internal
 */
export function applyDrillingStylesToColDef(
    colDef: AgGridColumnDef,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): AgGridColumnDef {
    return {
        ...colDef,
        cellClass: (params) => {
            return getCellClassName(params, drillableItems, dv);
        },
    };
}
