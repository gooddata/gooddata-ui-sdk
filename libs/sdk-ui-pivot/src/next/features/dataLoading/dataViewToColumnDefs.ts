// (C) 2024-2025 GoodData Corporation
import { ISortItem } from "@gooddata/sdk-model";
import { DataViewFacade, ExplicitDrill } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition } from "../../types/public.js";
import { IColumnSizing } from "../../types/sizing.js";
import { columnDefinitionToColId } from "../columnDefs/columnDefinitionToColId.js";
import { columnDefinitionToColumnDefWithAppliedExtras } from "../columnDefs/createColumnDefs.js";
import { columnDefsToPivotGroups } from "../pivoting/columnDefsToPivotGroups.js";
import { AgGridColumnDef, AgGridColumnGroupDef } from "../../types/agGrid.js";
import { ITableColumnDefinitionByColId } from "../../types/internal.js";

/**
 * @internal
 */
export function dataViewToColumnDefs(
    dataView: DataViewFacade,
    columnHeadersPosition: ColumnHeadersPosition,
    columnWidths: IColumnSizing["columnWidths"],
    sortBy: ISortItem[],
    drillableItems: ExplicitDrill[],
): {
    columnDefinitionByColId: ITableColumnDefinitionByColId;
    columnDefs: (AgGridColumnDef | AgGridColumnGroupDef)[];
    isPivoted: boolean;
} {
    const tableData = dataView.data().asTable();
    const columnDefinitionByColId: ITableColumnDefinitionByColId = {};

    tableData.columnDefinitions.forEach((columnDefinition) => {
        const colId = columnDefinitionToColId(
            columnDefinition,
            tableData.isTransposed,
            columnHeadersPosition,
        );
        columnDefinitionByColId[colId] = columnDefinition;
    });

    const colDefs = columnDefinitionToColumnDefWithAppliedExtras(
        tableData.columnDefinitions,
        tableData.isTransposed,
        columnHeadersPosition,
        columnWidths,
        sortBy,
        drillableItems,
        dataView,
    );

    const columnDefsWithPivotGroups = columnDefsToPivotGroups(
        colDefs,
        tableData.isTransposed,
        columnHeadersPosition,
    );

    return {
        columnDefinitionByColId,
        columnDefs: columnDefsWithPivotGroups,
        isPivoted: tableData.isPivoted,
    };
}
