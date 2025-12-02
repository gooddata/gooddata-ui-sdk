// (C) 2025 GoodData Corporation

import {
    ITableGrandTotalColumnDefinition,
    ITableSubtotalColumnDefinition,
    ITableValueColumnDefinition,
    isValueColumnDefinition,
} from "@gooddata/sdk-ui";

import { extractFormattedValue } from "./shared.js";
import { MetricCell } from "../../components/Cell/MetricCell.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { getMeasureCellStyle } from "../styling/cell.js";
import { getHeaderCellClassName } from "../styling/headerCell.js";

/**
 * Creates {@link AgGridColumnDef} for specified column definition {@link ITableValueColumnDefinition},
 * {@link ITableSubtotalColumnDefinition}, {@link ITableGrandTotalColumnDefinition}, if measures are not transposed.
 *
 * @internal
 */
export function createMeasureColDef(
    colId: string,
    columnDefinition: (
        | ITableValueColumnDefinition
        | ITableSubtotalColumnDefinition
        | ITableGrandTotalColumnDefinition
    ) & { isTransposed: false; isEmpty: false },
): AgGridColumnDef {
    const { measureDescriptor } = columnDefinition;

    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        context: {
            columnDefinition,
            cellRendererFactory: (params, cellTypes) => MetricCell({ ...params, cellTypes }),
        },
        headerClass: getHeaderCellClassName,
        cellStyle: getMeasureCellStyle,
        headerName: measureDescriptor.measureHeaderItem.name,
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        headerComponent: "MeasureHeader",
        sortable: isValueColumnDefinition(columnDefinition),
    };
}
