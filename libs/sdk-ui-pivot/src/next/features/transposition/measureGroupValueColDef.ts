// (C) 2025 GoodData Corporation

import { ITableMeasureGroupValueColumnDefinition } from "@gooddata/sdk-ui";

import { MEASURE_GROUP_VALUE_COL_DEF_ID } from "../../constants/internal.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { extractFormattedValue, metricCellRenderer } from "../columns/shared.js";
import { getCellClassName, getMeasureCellStyle } from "../styling/cell.js";
import { getHeaderCellClassName } from "../styling/headerCell.js";

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
        context: {
            columnDefinition,
        },
        valueGetter: (params) => {
            return extractFormattedValue(params, MEASURE_GROUP_VALUE_COL_DEF_ID);
        },
        cellClass: getCellClassName,
        cellStyle: getMeasureCellStyle,
        cellRenderer: metricCellRenderer,
        headerClass: getHeaderCellClassName,
        headerComponent: "EmptyMeasureGroupHeader",
        sortable: false,
    };
};
