// (C) 2024-2025 GoodData Corporation
import { DataViewFacade, ExplicitDrill } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { ColumnWidthItem } from "../../types/resizing.js";
import { columnDefinitionToColId } from "../columns/colId.js";
import { applyAllFeaturesToColDef } from "../columns/applyAllFeaturesToColDef.js";
import { columnDefsToPivotGroups } from "../pivoting/columnDefsToPivotGroups.js";
import { AgGridColumnDef, AgGridColumnGroupDef } from "../../types/agGrid.js";
import { ITableColumnDefinitionByColId } from "../../types/internal.js";
import { ITextWrapping } from "../../types/textWrapping.js";
import { createColDef } from "../columns/createColDef.js";

/**
 * Creates ag-grid col defs from the provided data view, applying all features to the col defs.
 *
 * @internal
 */
export function dataViewToColDefs({
    dataView,
    columnHeadersPosition,
    columnWidths,
    drillableItems,
    textWrapping,
}: {
    dataView: DataViewFacade;
    columnHeadersPosition: ColumnHeadersPosition;
    columnWidths: ColumnWidthItem[];
    drillableItems: ExplicitDrill[];
    textWrapping: ITextWrapping;
}): {
    columnDefinitionByColId: ITableColumnDefinitionByColId;
    columnDefs: (AgGridColumnDef | AgGridColumnGroupDef)[];
    columnDefsFlat: AgGridColumnDef[];
    isPivoted: boolean;
} {
    const sortBy = dataView.definition.sortBy;
    const tableData = dataView.data().asTable();
    const columnDefinitionByColId: ITableColumnDefinitionByColId = {};

    tableData.columnDefinitions.forEach((columnDefinition) => {
        const colId = columnDefinitionToColId(columnDefinition, columnHeadersPosition);
        columnDefinitionByColId[colId] = columnDefinition;
    });

    const colDefs = tableData.columnDefinitions.map((columnDefinition) => {
        const colDef = createColDef(columnDefinition, columnHeadersPosition);
        return applyAllFeaturesToColDef({
            columnWidths,
            sortBy,
            textWrapping,
            drillableItems,
            dataViewFacade: dataView,
        })(colDef);
    });

    const columnDefsWithPivotGroups = columnDefsToPivotGroups(colDefs, columnHeadersPosition);

    return {
        columnDefinitionByColId,
        columnDefs: columnDefsWithPivotGroups,
        columnDefsFlat: colDefs,
        isPivoted: tableData.isPivoted,
    };
}
