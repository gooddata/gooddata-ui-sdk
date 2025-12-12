// (C) 2025 GoodData Corporation

import { getColumnWidthItemForColumnDefinition } from "./getColumnWidthItemForColumnDefinition.js";
import { getColumnWidthItemValue } from "./getColumnWidthItemValue.js";
import { type AgGridColumnDef } from "../../types/agGrid.js";
import { type ColumnWidthItem } from "../../types/resizing.js";

/**
 * Applies provided column widths to col def.
 * If some column width item matches the col def, the width is applied to the col def.
 *
 * @internal
 */
export const applyColumnWidthsToColDef =
    (columnWidths: ColumnWidthItem[]) =>
    (colDef: AgGridColumnDef): AgGridColumnDef => {
        if (columnWidths.length === 0) {
            return colDef;
        }

        const { columnDefinition } = colDef.context;

        if (!columnDefinition) {
            console.error("Column definition is missing in colDef context", { colDef });
            return colDef;
        }

        const columnWidthItem = getColumnWidthItemForColumnDefinition(columnDefinition, columnWidths);
        const width = columnWidthItem ? getColumnWidthItemValue(columnWidthItem) : undefined;

        if (!(width === null || width === undefined)) {
            return {
                ...colDef,
                width,
            };
        }

        return colDef;
    };
