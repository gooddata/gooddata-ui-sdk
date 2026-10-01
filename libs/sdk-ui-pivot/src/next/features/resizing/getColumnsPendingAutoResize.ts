// (C) 2026 GoodData Corporation

import { type AgGridApi, type AgGridColumn } from "../../types/agGrid.js";

/**
 * @internal
 */
export function getColumnsPendingAutoResize(
    columns: AgGridColumn[],
    processedColumnIds: ReadonlySet<string>,
): AgGridColumn[] {
    return columns.filter(
        (col) =>
            !processedColumnIds.has(col.getId()) &&
            (col.getColDef().width === undefined || col.getColDef().width === null),
    );
}

/**
 * @internal
 */
export function getColumnsWithinViewport(api: AgGridApi, viewportWidth: number): AgGridColumn[] {
    const leftColumns = api.getDisplayedLeftColumns();
    const rightColumns = api.getDisplayedRightColumns();
    const pinnedWidth = [...leftColumns, ...rightColumns].reduce((acc, col) => acc + col.getActualWidth(), 0);
    const { left } = api.getHorizontalPixelRange();
    const right = left + viewportWidth - pinnedWidth;
    const centerColumns = api.getDisplayedCenterColumns().filter((col) => {
        const colLeft = col.getLeft() ?? 0;
        return colLeft < right && colLeft + col.getActualWidth() > left;
    });

    return [...leftColumns, ...centerColumns, ...rightColumns];
}
