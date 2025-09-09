// (C) 2007-2025 GoodData Corporation

import { CellClassParams, CellStyle } from "ag-grid-enterprise";
import cx from "classnames";

import { ClientFormatterFacade, IFormattedResult } from "@gooddata/number-formatter";
import { DataValue } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    ExplicitDrill,
    ITableDataValue,
    isStandardValueColumnDefinition,
    isSubtotalRowDefinition,
    isTableAttributeHeaderValue,
    isTableGrandTotalHeaderValue,
    isTableGrandTotalMeasureValue,
    isTableGrandTotalSubtotalMeasureValue,
    isTableMeasureValue,
    isTableOverallTotalMeasureValue,
    isTableSubtotalMeasureValue,
    isTableTotalHeaderValue,
} from "@gooddata/sdk-ui";

import { CELL_CLASSNAME, e } from "./bem.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { AgGridRowData } from "../../types/internal.js";
import { getAttributeColIds, parentsMatch } from "../columns/shared.js";
import { isCellDrillable } from "../drilling/isDrillable.js";

const getCellClassTypes = (
    params: CellClassParams<AgGridRowData, string | null>,
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
    const isColTotal = isColumnTotal(colData);
    const isOverallTotal = isTableOverallTotalMeasureValue(colData);
    const isColTotalWithinRowTotal = isColumnTotalWithinRowTotal(colData);
    const isTotalHeader = isTotalHeaderValue(colData);
    const isNull = isNullValue(colData);
    const isGrouped = isAttributeGroupedCell(params, colId);
    const isSeparated = isGroupFirstRow(params) && !isGrouped;
    const isMetric = !isAttribute && !isTotalHeader;
    const isTotal = isGrandTotal && !isColTotal;
    const isFirstOfGroup = measureIndex === 0;

    return {
        isDrillable,
        isAttribute,
        isTotal,
        isSubtotal,
        isColTotal,
        isOverallTotal,
        isColTotalWithinRowTotal,
        isTotalHeader,
        isNull,
        isGrouped,
        isSeparated,
        isMetric,
        isFirstOfGroup,
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
    const classTypes = getCellClassTypes(params, drillableItems, dv);

    if (!classTypes) {
        return CELL_CLASSNAME;
    }

    const {
        isDrillable,
        isAttribute,
        isSubtotal,
        isColTotal,
        isOverallTotal,
        isColTotalWithinRowTotal,
        isTotalHeader,
        isNull,
        isGrouped,
        isSeparated,
        isMetric,
        isFirstOfGroup,
        isTotal,
    } = classTypes;

    return cx(
        e("cell", {
            drillable: isDrillable,
            attribute: isAttribute,
            metric: isMetric,
            null: isNull,
            total: isTotal,
            subtotal: isSubtotal,
            "overall-total": isOverallTotal,
            "total-header": isTotalHeader,
            "column-total": isColTotal,
            "column-total-within-row-total": isColTotalWithinRowTotal,
            grouped: isGrouped,
            separated: isSeparated,
            "first-of-group": isFirstOfGroup,
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
    const classTypes = getCellClassTypes(params, drillableItems, dv);

    if (!classTypes) {
        return CELL_CLASSNAME;
    }

    const {
        isNull,
        isTotal,
        isSubtotal,
        isOverallTotal,
        isTotalHeader,
        isColTotal,
        isColTotalWithinRowTotal,
        isGrouped,
        isSeparated,
        isFirstOfGroup,
    } = classTypes;

    return cx(
        e("cell", {
            null: isNull,
            total: isTotal,
            subtotal: isSubtotal,
            "overall-total": isOverallTotal,
            "total-header": isTotalHeader,
            "column-total": isColTotal,
            "column-total-within-row-total": isColTotalWithinRowTotal,
            grouped: isGrouped,
            separated: isSeparated,
            "first-of-group": isFirstOfGroup,
        }),
    );
};

const isAttributeGroupedCell = (
    params: CellClassParams<AgGridRowData, string | null>,
    colId: string,
): boolean => {
    const { rowIndex, api, data } = params;

    if (rowIndex === 0) {
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

const isRowFirstOfGroup = (
    params: CellClassParams<AgGridRowData, string | null>,
    attributeColId: string,
): boolean => {
    const { rowIndex, api, data } = params;

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

const isGroupFirstRow = (params: CellClassParams<AgGridRowData, string | null>): boolean => {
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

const isGrandTotalValue = (colData: ITableDataValue) => {
    return isTableGrandTotalMeasureValue(colData) || isTableGrandTotalSubtotalMeasureValue(colData);
};

const isColumnTotal = (colData: ITableDataValue) => {
    const columnDefinition = colData.columnDefinition;

    return (
        columnDefinition && (columnDefinition.type === "grandTotal" || columnDefinition.type === "subtotal")
    );
};

const isColumnTotalWithinRowTotal = (colData: ITableDataValue) => {
    const columnDefinition = colData.columnDefinition;
    const rowDefinition = colData.rowDefinition;

    const isInTotalRow =
        rowDefinition && (rowDefinition.type === "grandTotal" || rowDefinition.type === "subtotal");

    return (
        columnDefinition &&
        (columnDefinition.type === "grandTotal" || columnDefinition.type === "subtotal") &&
        isInTotalRow
    );
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
    if (!("value" in cellData) || !cellData.value || !cellData.columnDefinition) {
        return {};
    }

    const format = isStandardValueColumnDefinition(cellData.columnDefinition)
        ? cellData.columnDefinition.measureDescriptor.measureHeaderItem.format
        : undefined;

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

/**
 * Creates cell style for measure columns with color formatting support.
 *
 * @param params - ag-grid cell style parameters
 * @returns Cell style object with colors applied
 */
export function getMeasureCellStyle(params: {
    data?: AgGridRowData;
    colDef?: { colId?: string };
}): CellStyle | null {
    const { data, colDef } = params;
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
