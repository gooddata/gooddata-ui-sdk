// (C) 2025 GoodData Corporation
import { IRowNode, ValueGetterParams } from "ag-grid-enterprise";
import { METRIC_EMPTY_VALUE } from "../../constants/internal.js";
import { AgGridCellRendererParams } from "../../types/agGrid.js";
import { AgGridRowData } from "../../types/internal.js";

/**
 * Common cell renderer for metrics.
 *
 * @internal
 */
export function metricCellRenderer(params: AgGridCellRendererParams) {
    const value = params.value;

    if (!value) {
        return METRIC_EMPTY_VALUE;
    }

    return value;
}

/**
 * Extracts formatted value from cell data.
 *
 * @internal
 */
export function extractFormattedValue(
    params: ValueGetterParams<AgGridRowData, string | null> | IRowNode<AgGridRowData> | null | undefined,
    colId: string,
): string | null {
    const cell = params?.data?.cellDataByColId?.[colId];

    if (!cell) {
        return null;
    }

    return cell.formattedValue;
}
