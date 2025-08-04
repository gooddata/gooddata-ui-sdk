// (C) 2024-2025 GoodData Corporation
import { ITableColumnDefinition } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR } from "../../constants/agGridDefaultProps.js";
import { columnDefinitionToColDefIdentifiers } from "./colDefIdentifiers.js";

/**
 * Creates unique identifier for specified column definition.
 * Is used as colId prop in ag-grid col defs (AgGridColumnDef), and cell key in specific row data (AgGridRowData.cellDataByColId).
 *
 * @internal
 */
export function columnDefinitionToColId(
    cell: ITableColumnDefinition,
    columnHeadersPosition: ColumnHeadersPosition,
): string {
    const columnPath = columnDefinitionToColDefIdentifiers(cell, columnHeadersPosition);
    return columnPath.join(AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR);
}
