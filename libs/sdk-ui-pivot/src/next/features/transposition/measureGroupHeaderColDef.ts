// (C) 2025 GoodData Corporation
import { type ITableMeasureGroupHeaderColumnDefinition } from "@gooddata/sdk-ui";

import { MEASURE_GROUP_HEADER_COL_DEF_ID } from "../../constants/internal.js";
import { type AgGridColumnDef } from "../../types/agGrid.js";
import { type ColumnHeadersPosition } from "../../types/transposition.js";
import { extractFormattedValue } from "../columns/shared.js";
import { getTransposedCellClassName } from "../styling/cell.js";
import { getHeaderCellClassName } from "../styling/headerCell.js";

/**
 * Creates common measure group header col def (for transposed table).
 *
 * @internal
 */
function createCommonMeasureGroupHeaderColDef(columnDefinition: ITableMeasureGroupHeaderColumnDefinition) {
    return {
        context: {
            columnDefinition,
        },
        cellClass: getTransposedCellClassName,
        cellRenderer: "MeasureGroupHeader",
        sortable: false,
    };
}

/**
 * Creates measure group header col def (for transposed table).
 *
 * @internal
 */
export const createMeasureGroupHeaderColDef = (
    colId: string,
    columnDefinition: ITableMeasureGroupHeaderColumnDefinition,
    columnHeadersPosition: ColumnHeadersPosition,
): AgGridColumnDef => {
    const commonDef = createCommonMeasureGroupHeaderColDef(columnDefinition);

    if (columnHeadersPosition === "left") {
        const lastAttributeDescriptor =
            columnDefinition.attributeDescriptors[columnDefinition.attributeDescriptors.length - 1];
        return {
            ...commonDef,
            colId,
            field: `cellDataByColId.${colId}.formattedValue`,
            headerName: lastAttributeDescriptor.attributeHeader.formOf.name,
            valueGetter: (params) => {
                return extractFormattedValue(params, colId);
            },
            headerClass: getHeaderCellClassName,
            headerComponent: "MeasureGroupHeader",
        };
    }
    return {
        ...commonDef,
        colId: MEASURE_GROUP_HEADER_COL_DEF_ID,
        field: `cellDataByColId.${MEASURE_GROUP_HEADER_COL_DEF_ID}.formattedValue`,
        valueGetter: (params) => {
            return extractFormattedValue(params, MEASURE_GROUP_HEADER_COL_DEF_ID);
        },
        headerClass: getHeaderCellClassName,
        headerComponent: "EmptyMeasureGroupHeader",
    };
};
