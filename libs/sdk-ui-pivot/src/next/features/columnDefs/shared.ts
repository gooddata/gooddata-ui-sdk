// (C) 2025 GoodData Corporation
import { METRIC_EMPTY_VALUE } from "../../constants/internal.js";
import { AgGridCellRendererParams } from "../../types/agGrid.js";

/**
 * @internal
 */
export function metricCellRenderer(params: AgGridCellRendererParams) {
    const value = params.value;

    if (!value) {
        return METRIC_EMPTY_VALUE;
    }

    return value;
}
