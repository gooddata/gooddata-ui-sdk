// (C) 2024-2025 GoodData Corporation

import { IntlShape } from "react-intl";

import { DataViewFacade, ExplicitDrill } from "@gooddata/sdk-ui";

import { AgGridColumnDef, AgGridColumnGroupDef } from "../../types/agGrid.js";
import { ITableColumnDefinitionByColId } from "../../types/internal.js";
import { ColumnWidthItem } from "../../types/resizing.js";
import { ITextWrapping } from "../../types/textWrapping.js";
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { applyAllFeaturesToColDef } from "../columns/applyAllFeaturesToColDef.js";
import { columnDefinitionToColId } from "../columns/colId.js";
import { createColDef } from "../columns/createColDef.js";
import { columnDefsToPivotGroups } from "../pivoting/columnDefsToPivotGroups.js";

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
    intl,
}: {
    dataView: DataViewFacade;
    columnHeadersPosition: ColumnHeadersPosition;
    columnWidths: ColumnWidthItem[];
    drillableItems: ExplicitDrill[];
    textWrapping: ITextWrapping;
    intl: IntlShape;
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
        const colDef = createColDef(columnDefinition, columnHeadersPosition, intl, drillableItems, dataView);
        return applyAllFeaturesToColDef({
            columnWidths,
            sortBy,
            textWrapping,
            drillableItems,
            dataViewFacade: dataView,
        })(colDef);
    });

    const columnDefsWithPivotGroups = columnDefsToPivotGroups(colDefs, columnHeadersPosition, intl);

    return {
        columnDefinitionByColId,
        columnDefs: columnDefsWithPivotGroups,
        columnDefsFlat: colDefs,
        isPivoted: tableData.isPivoted,
    };
}
