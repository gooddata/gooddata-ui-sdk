// (C) 2025 GoodData Corporation
import {
    DataViewFacade,
    ExplicitDrill,
    ITableGrandTotalColumnDefinition,
    ITableSubtotalColumnDefinition,
    ITableValueColumnDefinition,
    isValueColumnDefinition,
} from "@gooddata/sdk-ui";

import { extractFormattedValue, metricCellRenderer } from "./shared.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { getCellClassName } from "../styling/cell.js";
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
        headerName: measureDescriptor.measureHeaderItem.name,
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        cellRenderer: metricCellRenderer,
        headerComponentParams: {
            // We need to use inner component to preserve sorting interactions
            innerHeaderComponent: "MeasureHeader",
        },
        sortable: isValueColumnDefinition(columnDefinition),
    };
}
