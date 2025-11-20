// (C) 2007-2025 GoodData Corporation

import { CellClassParams, CellStyle, ICellRendererParams } from "ag-grid-enterprise";
import cx from "classnames";

import { ClientFormatterFacade, IFormattedResult } from "@gooddata/number-formatter";
import { DataValue } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    ExplicitDrill,
    ITableColumnDefinition,
    ITableDataValue,
    isGrandTotalColumnDefinition,
    isGrandTotalRowDefinition,
    isMeasureGroupValueColumnDefinition,
    isStandardGrandTotalColumnDefinition,
    isStandardSubtotalColumnDefinition,
    isStandardValueColumnDefinition,
    isSubtotalColumnDefinition,
    isSubtotalRowDefinition,
    isTableAttributeHeaderValue,
    isTableGrandTotalHeaderValue,
    isTableGrandTotalMeasureValue,
    isTableGrandTotalSubtotalMeasureValue,
    isTableMeasureHeaderValue,
    isTableMeasureValue,
    isTableOverallTotalMeasureValue,
    isTableSubtotalMeasureValue,
    isTableTotalHeaderValue,
    isValueColumnDefinition,
    isValueRowDefinition,
} from "@gooddata/sdk-ui";

import { CELL_CLASSNAME, e } from "./bem.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { AgGridRowData } from "../../types/internal.js";
import { getAttributeColIds, parentsMatch } from "../columns/shared.js";
import { isCellDrillable } from "../drilling/isDrillable.js";

export type CellTypes = ReturnType<typeof getCellTypes>;

/**
 * Common parameters shared between CellClassParams and ICellRendererParams
 */
type CommonCellParams =
    | CellClassParams<AgGridRowData, string | null>
    | ICellRendererParams<AgGridRowData, string | null>;

/**
 * Type guard to check if params is CellClassParams (has rowIndex directly)
 */
const isCellClassParams = (params: unknown): params is CellClassParams<AgGridRowData, string | null> => {
    return (
        params !== undefined &&
        params !== null &&
        (params as CellClassParams<AgGridRowData, string | null>).rowIndex !== undefined
    );
};

/**
 * Type guard to check if params is ICellRendererParams (has node.rowIndex)
 */
const isCellRendererParams = (
    params: unknown,
): params is ICellRendererParams<AgGridRowData, string | null> => {
    return (
        !isCellClassParams(params) &&
        params !== undefined &&
        params !== null &&
        (params as ICellRendererParams<AgGridRowData, string | null>).node !== undefined
    );
};

/**
 * Helper function to get rowIndex from either CellClassParams or ICellRendererParams
 */
const getRowIndex = (params: CommonCellParams): number | null => {
    if (isCellClassParams(params)) {
        return params.rowIndex;
    }
    if (isCellRendererParams(params)) {
        return params.node.rowIndex;
    }
    return null;
};

/**
 * Determines whether the current cell belongs to the last pinned-top row.
 */
const isPinnedTopLastRow = (params: CommonCellParams, isPinnedTop: boolean): boolean => {
    if (!isPinnedTop) {
        return false;
    }

    const rowIndex = getRowIndex(params);
    if (rowIndex === null) {
        return false;
    }

    const pinnedTopRowCount: number | undefined = params.api?.getPinnedTopRowCount?.();
    if (typeof pinnedTopRowCount !== "number" || pinnedTopRowCount <= 0) {
        return false;
    }

    return rowIndex === pinnedTopRowCount - 1;
};

/**
 * Helper function to get rowPinned from either CellClassParams or ICellRendererParams.
 *
 * Returns "top" | "bottom" when the row is pinned, null otherwise.
 */
const getRowPinned = (params: CommonCellParams): "top" | "bottom" | null => {
    if (isCellClassParams(params)) {
        return params.node?.rowPinned ?? null;
    }
    if (isCellRendererParams(params)) {
        return params.node?.rowPinned ?? null;
    }
    return null;
};

export const getCellTypes = (
    params: CommonCellParams,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
) => {
    const { colDef, data } = params;
    const colId = colDef?.colId ?? colDef?.field;

    if (!colDef || !data || !colId) {
        return undefined;
    }

    const colData = data.cellDataByColId?.[colId];

    if (!colData) {
        return undefined;
    }

    const measureIndex = colDef?.context?.measureIndex;
    const isGrandTotal = isGrandTotalValue(colData);
    const isTransposedSubtotalCell =
        isTableMeasureValue(colData) && isSubtotalRowDefinition(colData.rowDefinition);

    const isDrillable = isCellDrillable(colDef as AgGridColumnDef, data, drillableItems ?? [], dv);
    const isAttribute = isTableAttributeHeaderValue(colData);
    const isSubtotal = isTableSubtotalMeasureValue(colData) || isTransposedSubtotalCell;
    const isColSubtotal = isColumnSubtotal(colData);
    const isColGrandTotal = isColumnGrandTotal(colData);
    const isOverallTotal = isTableOverallTotalMeasureValue(colData);
    const isRowTotal = colData.rowDefinition?.type === "grandTotal";
    const isRowSubtotal = colData.rowDefinition?.type === "subtotal";
    const isTotalHeader = isTotalHeaderValue(colData);
    const isSubtotalHeader = isSubtotalHeaderValue(colData);
    const isNull = isNullValue(colData);
    const isGrouped = isAttributeGroupedCell(params, colId);
    const isSeparated = isGroupFirstRow(params) && !isGrouped;
    const isMetric = !isAttribute && !isTotalHeader;
    const isTotal = isGrandTotal && !isColGrandTotal; // grand total but not column grand total
    const isFirstOfGroup = measureIndex === 0;
    const isMeasureHeader = isTableMeasureHeaderValue(colData);

    const columnDefinition = colDef.context?.columnDefinition;
    const isTransposed = columnDefinition?.isTransposed ?? false;

    const leftBorderWhenTransposed =
        !isTotalHeader &&
        !isSubtotalHeader &&
        !isColSubtotal &&
        !isColGrandTotal &&
        !isOverallTotal &&
        !isMeasureHeader &&
        !isAttribute;

    const isTransposedLeftBorder = isTransposed && leftBorderWhenTransposed;

    const rowPinned = getRowPinned(params);
    const isPinnedTop = rowPinned === "top";
    const isPinnedBottom = rowPinned === "bottom";

    const isPinnedTopLast = isPinnedTopLastRow(params, isPinnedTop);

    return {
        isDrillable,
        isAttribute,
        isTotal,
        isSubtotal,
        isColSubtotal,
        isColGrandTotal,
        isOverallTotal,
        isTotalHeader,
        isSubtotalHeader,
        isRowTotal,
        isRowSubtotal,
        isNull,
        isGrouped,
        isSeparated,
        isMetric,
        isFirstOfGroup,
        isTransposedLeftBorder,
        isPinnedTop,
        isPinnedBottom,
        isPinnedTopLast,
    };
};

/**
 * Returns a class name for a cell.
 *
 * @param params - The cell class params
 * @param drillableItems - The drillable items
 * @param dv - The data view facade
 * @returns A class name for the cell
 */
export const getCellClassName = (
    params: CellClassParams<AgGridRowData, string | null>,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): string => {
    const cellTypes = getCellTypes(params, drillableItems, dv);

    if (!cellTypes) {
        return CELL_CLASSNAME;
    }

    const {
        isDrillable,
        isAttribute,
        isSubtotal,
        isColSubtotal,
        isColGrandTotal,
        isOverallTotal,
        isTotalHeader,
        isSubtotalHeader,
        isRowTotal,
        isRowSubtotal,
        isNull,
        isGrouped,
        isSeparated,
        isMetric,
        isFirstOfGroup,
        isTotal,
        isTransposedLeftBorder,
        isPinnedTop,
        isPinnedBottom,
        isPinnedTopLast,
    } = cellTypes;

    return cx(
        e("cell", {
            drillable: isDrillable,
            attribute: isAttribute,
            metric: isMetric,
            null: isNull,
            total: isTotal,
            subtotal: isSubtotal,
            "subtotal-header": isSubtotalHeader,
            "overall-total": isOverallTotal,
            "total-header": isTotalHeader,
            "column-total": isColGrandTotal,
            "column-subtotal": isColSubtotal,
            "row-total": isRowTotal,
            "row-subtotal": isRowSubtotal,
            "row-subtotal-column-subtotal": isRowSubtotal && isColSubtotal,
            "row-total-column-subtotal": isRowTotal && isColSubtotal,
            "row-total-column-total": isRowTotal && isColGrandTotal,
            "row-subtotal-column-total": isRowSubtotal && isColGrandTotal,
            grouped: isGrouped,
            separated: isSeparated,
            "first-of-group": isFirstOfGroup,
            "transposed-left-border": isTransposedLeftBorder,
            "pinned-top": isPinnedTop,
            "pinned-bottom": isPinnedBottom,
            "pinned-top-last": isPinnedTopLast,
        }),
    );
};

/**
 * Returns a class name for a transposed cell.
 *
 * As the table is transposed, this is usually used for header cells in rows.
 *
 * @param params - The cell class params
 * @param drillableItems - The drillable items
 * @param dv - The data view facade
 * @returns A class name for the cell
 */
export const getTransposedCellClassName = (
    params: CellClassParams<AgGridRowData, string | null>,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): string => {
    const cellTypes = getCellTypes(params, drillableItems, dv);

    if (!cellTypes) {
        return CELL_CLASSNAME;
    }

    const {
        isNull,
        isTotal,
        isSubtotal,
        isOverallTotal,
        isTotalHeader,
        isSubtotalHeader,
        isColSubtotal,
        isColGrandTotal,
        isRowTotal,
        isRowSubtotal,
        isGrouped,
        isSeparated,
        isFirstOfGroup,
        isTransposedLeftBorder,
        isPinnedTop,
        isPinnedBottom,
        isPinnedTopLast,
    } = cellTypes;
    return cx(
        e("cell", {
            null: isNull,
            total: isTotal,
            subtotal: isSubtotal,
            "subtotal-header": isSubtotalHeader,
            "overall-total": isOverallTotal,
            "total-header": isTotalHeader,
            "column-total": isColGrandTotal,
            "column-subtotal": isColSubtotal,
            "row-total": isRowTotal,
            "row-subtotal": isRowSubtotal,
            "row-subtotal-column-subtotal": isRowSubtotal && isColSubtotal,
            "row-total-column-subtotal": isRowTotal && isColSubtotal,
            "row-total-column-total": isRowTotal && isColGrandTotal,
            "row-subtotal-column-total": isRowSubtotal && isColGrandTotal,
            grouped: isGrouped,
            separated: isSeparated,
            "first-of-group": isFirstOfGroup,
            "transposed-left-border": isTransposedLeftBorder,
            "pinned-top": isPinnedTop,
            "pinned-bottom": isPinnedBottom,
            "pinned-top-last": isPinnedTopLast,
        }),
    );
};

const isAttributeGroupedCell = (params: CommonCellParams, colId: string): boolean => {
    const rowIndex = getRowIndex(params);
    const { api, data } = params;

    if (rowIndex === null || rowIndex === 0) {
        return false;
    }

    const previousRow = api.getDisplayedRowAtIndex(rowIndex - 1);
    if (!previousRow?.data) {
        return false;
    }

    const currentRow = data?.cellDataByColId?.[colId];
    if (
        !currentRow ||
        currentRow.type !== "attributeHeader" ||
        currentRow.columnDefinition.type !== "attribute"
    ) {
        return false;
    }

    const currentColumnIndex = currentRow.columnDefinition.columnIndex;

    // Ensure all parent attributes (lower columnIndex) match between current and previous rows
    if (!parentsMatch(data, previousRow.data, currentColumnIndex)) {
        return false;
    }

    const currentValue = currentRow.formattedValue;
    const previousValue = previousRow.data.cellDataByColId?.[colId]?.formattedValue;

    return currentValue === previousValue && currentValue !== undefined && currentValue !== "";
};

const isRowFirstOfGroup = (params: CommonCellParams, attributeColId: string): boolean => {
    const rowIndex = getRowIndex(params);
    const { api, data } = params;

    if (rowIndex === null) {
        return false;
    }

    const currentRow = data?.cellDataByColId?.[attributeColId];
    if (!currentRow || currentRow.columnDefinition.type !== "attribute") {
        return false;
    }

    const currentValue = currentRow.formattedValue;
    if (currentValue === undefined || currentValue === "") {
        return false;
    }

    const currentColumnIndex = currentRow.columnDefinition.columnIndex;

    // Check if the next row has the same attribute value
    const nextRow = api.getDisplayedRowAtIndex(rowIndex + 1);
    if (!nextRow?.data) {
        return false;
    }

    const nextRowData = nextRow.data.cellDataByColId?.[attributeColId];
    if (!nextRowData || nextRowData.columnDefinition.type !== "attribute") {
        return false;
    }

    const nextValue = nextRowData.formattedValue;

    // If current value equals next value, check if this is the first occurrence
    if (currentValue === nextValue) {
        // Check if all parent attributes have the same values in current and next rows
        if (!parentsMatch(data, nextRow.data, currentColumnIndex)) {
            return false;
        }

        // Check if the previous row has a different value (making this the first of the group)
        if (rowIndex === 0) {
            // First row is always the first of its group if it has the same value as next row
            return true;
        }

        const previousRow = api.getDisplayedRowAtIndex(rowIndex - 1);
        if (!previousRow?.data) {
            return true;
        }

        const previousRowData = previousRow.data.cellDataByColId?.[attributeColId];
        if (!previousRowData || previousRowData.columnDefinition.type !== "attribute") {
            return true;
        }

        const previousValue = previousRowData.formattedValue;

        // This is the first of a group if previous value is different
        return previousValue !== currentValue;
    }

    return false;
};

const isGroupFirstRow = (params: CommonCellParams): boolean => {
    const { data } = params;

    const attributeColIds = getAttributeColIds(data);

    if (attributeColIds.length === 0) {
        return false;
    }

    return attributeColIds.some((attributeColId) => isRowFirstOfGroup(params, attributeColId));
};

const isTotalHeaderValue = (colData: ITableDataValue) => {
    return isTableTotalHeaderValue(colData) || isTableGrandTotalHeaderValue(colData);
};

const isSubtotalHeaderValue = (colData: ITableDataValue) => {
    return isTableTotalHeaderValue(colData) && !isTableGrandTotalHeaderValue(colData);
};

const isGrandTotalValue = (colData: ITableDataValue) => {
    return isTableGrandTotalMeasureValue(colData) || isTableGrandTotalSubtotalMeasureValue(colData);
};

const isColumnSubtotal = (colData: ITableDataValue) => {
    const columnDefinition = colData.columnDefinition;

    return columnDefinition && columnDefinition.type === "subtotal";
};

const isColumnGrandTotal = (colData: ITableDataValue) => {
    const columnDefinition = colData.columnDefinition;

    return columnDefinition && columnDefinition.type === "grandTotal";
};

const isNullValue = (colData: ITableDataValue) => {
    return !isTableAttributeHeaderValue(colData) && colData.formattedValue === "";
};

/**
 * Extracts color information from formatted cell data.
 *
 * @param cellData - The cell data containing value and column definition
 * @returns Object containing color and backgroundColor CSS values
 */
function extractColorsFromCellData(cellData: ITableDataValue): { color?: string; backgroundColor?: string } {
    if (!("value" in cellData) || cellData.value == null || !cellData.columnDefinition) {
        return {};
    }

    const isTransposed = isTransposedColumnDefinition(cellData.columnDefinition);

    let format: string | undefined = undefined;
    if (isTransposed) {
        if (isValueRowDefinition(cellData.rowDefinition)) {
            const rowsScope = cellData.rowDefinition.rowScope;
            const measureDescriptor = rowsScope.find((s) => s.type === "measureScope")?.descriptor;
            format = measureDescriptor?.measureHeaderItem.format;
        } else if (isSubtotalRowDefinition(cellData.rowDefinition)) {
            const rowsScope = cellData.rowDefinition.rowScope;
            const measureDescriptor = rowsScope.find((s) => s.type === "measureTotalScope")?.descriptor;
            format = measureDescriptor?.measureHeaderItem.format;
        } else if (isGrandTotalRowDefinition(cellData.rowDefinition)) {
            const measureDescriptors = cellData.rowDefinition.measureDescriptors;
            // In transposed tables, each grand total row represents one measure
            format = measureDescriptors[0]?.measureHeaderItem.format;
        }
    } else {
        // Non-transposed: get format from column definition's measure descriptor
        if (
            isStandardValueColumnDefinition(cellData.columnDefinition) ||
            isStandardSubtotalColumnDefinition(cellData.columnDefinition) ||
            isStandardGrandTotalColumnDefinition(cellData.columnDefinition)
        ) {
            format = cellData.columnDefinition.measureDescriptor.measureHeaderItem.format;
        }
    }

    if (!format) {
        return {};
    }

    const convertedValue = ClientFormatterFacade.convertValue(cellData.value as DataValue);
    const formattedResult: IFormattedResult = ClientFormatterFacade.formatValue(convertedValue, format);

    return {
        color: formattedResult.colors?.color,
        backgroundColor: formattedResult.colors?.backgroundColor,
    };
}

const isTransposedColumnDefinition = (columnDefinition: ITableColumnDefinition): boolean => {
    // measureGroupValue column only exists in transposed tables
    if (isMeasureGroupValueColumnDefinition(columnDefinition)) {
        return true;
    }

    // Check isTransposed flag for value and total columns
    if (
        isValueColumnDefinition(columnDefinition) ||
        isGrandTotalColumnDefinition(columnDefinition) ||
        isSubtotalColumnDefinition(columnDefinition)
    ) {
        return columnDefinition.isTransposed;
    }

    return false;
};

/**
 * Creates cell style for measure columns with color formatting support.
 *
 * @param params - ag-grid cell style parameters
 * @returns Cell style object with colors applied
 */
export function getMeasureCellStyle({
    data,
    colDef,
}: {
    data?: AgGridRowData;
    colDef?: { colId?: string };
}): CellStyle | null {
    const colId = colDef?.colId;

    if (!data || !colId) {
        return null;
    }

    const cellData = data.cellDataByColId?.[colId];

    if (!cellData) {
        return null;
    }

    // Extract colors from the formatted cell data
    const { color, backgroundColor } = extractColorsFromCellData(cellData);

    const measureCellDefault: CellStyle = {
        textAlign: "right",
    };

    // If no colors are specified, return default styling
    if (!color && !backgroundColor) {
        return measureCellDefault;
    }

    // Apply colors if they exist
    return {
        ...measureCellDefault,
        ...(color && { color }),
        ...(backgroundColor && { backgroundColor }),
    };
}
