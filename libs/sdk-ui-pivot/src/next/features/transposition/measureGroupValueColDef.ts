// (C) 2025 GoodData Corporation
import { MEASURE_GROUP_VALUE_COL_DEF_ID } from "../../constants/internal.js";
import { metricCellRenderer, extractFormattedValue } from "../columns/shared.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { ITableMeasureGroupValueColumnDefinition } from "@gooddata/sdk-ui";

/**
 * Creates measure group value col def (for transposed table).
 * This definition is created only when measures are rendered in rows, and table is not pivoted.
 *
 * @internal
 */
export const createMeasureGroupValueColDef = (
    columnDefinition: ITableMeasureGroupValueColumnDefinition,
): AgGridColumnDef => {
    return {
        colId: MEASURE_GROUP_VALUE_COL_DEF_ID,
        field: `cellDataByColId.${MEASURE_GROUP_VALUE_COL_DEF_ID}.formattedValue`,
        headerName: "",
        context: {
            columnDefinition,
        },
        valueGetter: (params) => {
            return extractFormattedValue(params, MEASURE_GROUP_VALUE_COL_DEF_ID);
        },
        cellRenderer: metricCellRenderer,
        sortable: false,
    };
};
