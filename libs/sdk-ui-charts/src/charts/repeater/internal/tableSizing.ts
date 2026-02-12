// (C) 2022-2026 GoodData Corporation

import { type RefObject } from "react";

import { getManualResizedColumn } from "./columnSizing.js";
import { type ColumnResizingConfig, type ResizingState } from "./privateTypes.js";
import { scheduleAnimationFrame } from "../../_base/animationFrameScheduler.js";

export function growToFit(resizingState: RefObject<ResizingState>, resizingConfig: ColumnResizingConfig) {
    if (!resizingConfig.growToFit) {
        return;
    }

    const { columnApi, containerElement, growToFitFrame } = resizingState.current;

    if (!columnApi) {
        return;
    }

    const columns = columnApi.getAllGridColumns();
    const autoSizeColumns = columns.filter((col) => {
        return col.getColDef().resizable && !getManualResizedColumn(resizingState, col);
    });
    const manualSizedColumns = columns.filter((col) => {
        return col.getColDef().resizable && getManualResizedColumn(resizingState, col);
    });

    if (autoSizeColumns.length === 0) {
        return;
    }

    const manualWidths = manualSizedColumns.map((column) => column.getActualWidth());
    const sumOfManualWidths = manualWidths.reduce((a, b) => a + b, 0);

    const clientWidth = getColsViewportClientWidth(containerElement);
    if (clientWidth <= 0 || sumOfManualWidths >= clientWidth) {
        return;
    }

    const width = (clientWidth - sumOfManualWidths) / autoSizeColumns.length;

    const columnWidthItems: Array<{ key: string; newWidth: number }> = [];

    autoSizeColumns.forEach((columnWidthItem) => {
        columnWidthItems.push({ key: columnWidthItem.getColId(), newWidth: width });
    });

    scheduleAnimationFrame(growToFitFrame, () => {
        const { columnApi } = resizingState.current;
        columnApi?.setColumnWidths(columnWidthItems);
        columnApi?.refreshCells();
    });
}

/**
 * Returns the available width in the AG Grid body viewport.
 * Uses clientWidth, which excludes the vertical scrollbar when present (CSSOM).
 */
function getColsViewportClientWidth(container: HTMLDivElement | null): number {
    return container?.getElementsByClassName("ag-center-cols-viewport")[0]?.clientWidth ?? 0;
}
