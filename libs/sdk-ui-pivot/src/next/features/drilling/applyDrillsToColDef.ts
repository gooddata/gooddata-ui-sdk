// (C) 2025 GoodData Corporation
import { DataViewFacade, ExplicitDrill, isMeasureGroupHeaderColumnDefinition } from "@gooddata/sdk-ui";

import { AgGridColumnDef } from "../../types/agGrid.js";
import { getCellClassName, getTransposedCellClassName } from "../styling/cell.js";

/**
 * Applies drilling to the ag-grid col def.
 *
 * @internal
 */
export const applyDrillsToColDef =
    (drillableItems: ExplicitDrill[], dv?: DataViewFacade) =>
    (colDef: AgGridColumnDef): AgGridColumnDef => {
        if (drillableItems.length === 0 || !dv) {
            return colDef;
        }

        return {
            ...colDef,
            cellClass: (params) => {
                if (isMeasureGroupHeaderColumnDefinition(params.colDef.context.columnDefinition)) {
                    return getTransposedCellClassName(params, drillableItems, dv);
                }

                return getCellClassName(params, drillableItems, dv);
            },
        };
    };
