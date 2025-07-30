// (C) 2024-2025 GoodData Corporation
import { ISortItem } from "@gooddata/sdk-model";
import { DataViewFacade, ExplicitDrill, ITableColumnDefinition } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition } from "../../types/public.js";
import { IColumnSizing } from "../../types/sizing.js";
import { columnDefinitionToColDef } from "./columnDefinitionToColDef.js";
import { applyColumnWidthToColDef } from "../columnSizing/applyColumnWidthToColDef.js";
import { getSortForColumnDefinition } from "../sorting/sortModelToSortItems.js";
import { applyInitialSortToColDef } from "../sorting/applyInitialSortToColDef.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { applyDrillingStylesToColDef } from "../drilling/applyDrillingStylesToColDef.js";

/**
 * @internal
 */
export function columnDefinitionToColumnDefWithAppliedExtras(
    columnDefinitions: ITableColumnDefinition[],
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
    columnWidths: IColumnSizing["columnWidths"],
    sortBy: ISortItem[],
    drillableItems: ExplicitDrill[],
    dataViewFacade?: DataViewFacade,
): AgGridColumnDef[] {
    return columnDefinitions.map((columnDefinition) => {
        let colDef = columnDefinitionToColDef(columnDefinition, isTransposed, columnHeadersPosition);
        colDef = applyColumnWidthToColDef(colDef, columnWidths);

        const sort = getSortForColumnDefinition(columnDefinition, sortBy);

        if (sort) {
            colDef = applyInitialSortToColDef(colDef, sort);
        }

        if (drillableItems && dataViewFacade) {
            colDef = applyDrillingStylesToColDef(colDef, drillableItems, dataViewFacade);
        }

        return colDef;
    });
}
