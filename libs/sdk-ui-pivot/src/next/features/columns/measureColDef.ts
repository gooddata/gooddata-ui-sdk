// (C) 2025 GoodData Corporation

import { ICellRendererParams } from "ag-grid-enterprise";

import {
    DataViewFacade,
    ExplicitDrill,
    ITableGrandTotalColumnDefinition,
    ITableSubtotalColumnDefinition,
    ITableValueColumnDefinition,
    isValueColumnDefinition,
} from "@gooddata/sdk-ui";

import { extractFormattedValue } from "./shared.js";
import { MetricCell } from "../../components/Cell/MetricCell.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { getCellClassName, getCellTypes, getMeasureCellStyle } from "../styling/cell.js";
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
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): AgGridColumnDef {
    const { measureDescriptor } = columnDefinition;

    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        context: {
            columnDefinition,
        },
        headerClass: getHeaderCellClassName,
        cellClass: (params) => {
            return getCellClassName(params, drillableItems, dv);
        },
        cellStyle: getMeasureCellStyle,
        headerName: measureDescriptor.measureHeaderItem.name,
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        cellRenderer: (params: ICellRendererParams) => {
            const cellTypes = getCellTypes(params, drillableItems, dv);
            return MetricCell({ ...params, cellTypes });
        },
        headerComponent: "MeasureHeader",
        sortable: isValueColumnDefinition(columnDefinition),
    };
}
