// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { createColumnWidthItemForColumnDefinition } from "../../features/resizing/createColumnWidthItemForColumnDefinition.js";
import { isColumnWidthItemMatch } from "../../features/resizing/isColumnWidthItemMatch.js";
import { type AgGridOnColumnResized } from "../../types/agGrid.js";
import { type ColumnWidthItem } from "../../types/resizing.js";

/**
 * Triggers `onColumnResized` callback on pivot table, when column is manually resized.
 *
 * @internal
 */
export function useManualResize() {
    const { config, onColumnResized: onColumnResizedProp } = usePivotTableProps();
    const { columnSizing } = config;
    const { columnWidths } = columnSizing;

    const handleManualResize = useCallback<AgGridOnColumnResized>(
        (params) => {
            const isUiResize = params.source === "uiColumnResized";
            if (!isUiResize) {
                return;
            }

            const columns = params.column ? [params.column] : params.columns;

            const newColumnWidths = columns?.map((column) => {
                const colDef = column.getColDef();
                const updatedWidth = column.getActualWidth();
                return createColumnWidthItemForColumnDefinition(
                    colDef.context.columnDefinition,
                    updatedWidth,
                );
            });

            const updated = newColumnWidths?.reduce((acc, newOrUpdatedWidthItem) => {
                return updateColumnWidthsWithColumnWidth(acc, newOrUpdatedWidthItem);
            }, columnWidths);

            if (updated) {
                onColumnResizedProp?.(updated);
            }
        },
        [onColumnResizedProp, columnWidths],
    );

    return {
        handleManualResize,
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
