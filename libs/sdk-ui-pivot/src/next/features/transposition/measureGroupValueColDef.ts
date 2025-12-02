// (C) 2025 GoodData Corporation

import { ITableMeasureGroupValueColumnDefinition } from "@gooddata/sdk-ui";

import { MetricCell } from "../../components/Cell/MetricCell.js";
import { MEASURE_GROUP_VALUE_COL_DEF_ID } from "../../constants/internal.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { extractFormattedValue } from "../columns/shared.js";
import { getMeasureCellStyle } from "../styling/cell.js";
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
            cellRendererFactory: (params, cellTypes) => MetricCell({ ...params, cellTypes }),
        },
        valueGetter: (params) => {
            return extractFormattedValue(params, MEASURE_GROUP_VALUE_COL_DEF_ID);
        },
        cellStyle: getMeasureCellStyle,
        headerClass: getHeaderCellClassName,
        headerComponent: "EmptyMeasureGroupValueHeader",
        sortable: false,
    };
};
