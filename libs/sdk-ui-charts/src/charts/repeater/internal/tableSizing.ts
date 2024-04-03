// (C) 2022-2024 GoodData Corporation

import { MutableRefObject } from "react";
import { ResizingState, ColumnResizingConfig } from "./privateTypes.js";
import { getManualResizedColumn } from "./columnSizing.js";

export function growToFit(
    resizingState: MutableRefObject<ResizingState>,
    resizingConfig: ColumnResizingConfig,
) {
    if (!resizingConfig.growToFit) {
        return;
    }

    const { columnApi } = resizingState.current;

    if (!columnApi) {
        return;
    }

    const columns = columnApi.getAllColumns();
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

    // Consider scrollbar width = 15
    const clientWidth = resizingConfig.clientWidth - 15;

    if (sumOfManualWidths >= clientWidth) {
        return;
    }

    const width = (clientWidth - sumOfManualWidths) / autoSizeColumns.length;

    const autoSizedWidths = autoSizeColumns.map(() => width);
    autoSizeColumns.forEach((column, index) => {
        columnApi.setColumnWidth(column, autoSizedWidths[index]);
    });
}
