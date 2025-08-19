// (C) 2025 GoodData Corporation
import { useCallback, useRef } from "react";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { createColumnWidthItemForColumnDefinition } from "../../features/resizing/createColumnWidthItemForColumnDefinition.js";
import { isColumnWidthItemMatch } from "../../features/resizing/isColumnWidthItemMatch.js";
import { AgGridOnColumnResized } from "../../types/agGrid.js";
import { ColumnWidthItem } from "../../types/resizing.js";

/**
 * Triggers `onColumnResized` callback on pivot table, when column is manually resized.
 *
 * @internal
 */
export function useUpdateColumnWidth() {
    const { config, onColumnResized: onColumnResizedProp } = usePivotTableProps();
    const { columnSizing } = config;
    const { columnWidths } = columnSizing;

    // Store current column widths to compare with new column widths
    const currentColumnWidths = useRef<ColumnWidthItem[]>(columnWidths ?? []);

    const onUpdateColumnWidth = useCallback<AgGridOnColumnResized>(
        (params) => {
            if (!params.column) {
                return;
            }
            const colDef = params.column.getColDef();
            const updatedWidth = params.column.getActualWidth();
            const newOrUpdatedWidthItem = createColumnWidthItemForColumnDefinition(
                colDef.context.columnDefinition,
                updatedWidth,
            );
            const newColumnWidths = updateColumnWidthsWithColumnWidth(
                currentColumnWidths.current,
                newOrUpdatedWidthItem,
            );

            currentColumnWidths.current = newColumnWidths;
            onColumnResizedProp?.(newColumnWidths);
        },
        [onColumnResizedProp],
    );

    return {
        onUpdateColumnWidth,
    };
}

function updateColumnWidthsWithColumnWidth(
    columnWidths: ColumnWidthItem[],
    newOrUpdatedColumnWidthItem: ColumnWidthItem,
) {
    if (!columnWidths) {
        return [newOrUpdatedColumnWidthItem];
    }

    let isUpdate = false;
    const updatedColumnWidths: ColumnWidthItem[] = [];

    columnWidths.forEach((existingColumnWidthItem) => {
        if (isColumnWidthItemMatch(existingColumnWidthItem, newOrUpdatedColumnWidthItem)) {
            updatedColumnWidths.push(newOrUpdatedColumnWidthItem);
            isUpdate = true;
        } else {
            updatedColumnWidths.push(existingColumnWidthItem);
        }
    });

    if (!isUpdate) {
        updatedColumnWidths.push(newOrUpdatedColumnWidthItem);
    }

    return updatedColumnWidths;
}
