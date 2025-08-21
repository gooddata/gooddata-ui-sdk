// (C) 2007-2025 GoodData Corporation
import { CellClassParams } from "ag-grid-enterprise";
import cx from "classnames";

import {
    DataViewFacade,
    ExplicitDrill,
    ITableDataValue,
    isTableAttributeHeaderValue,
    isTableGrandTotalHeaderValue,
    isTableGrandTotalMeasureValue,
    isTableGrandTotalSubtotalMeasureValue,
    isTableOverallTotalMeasureValue,
    isTableSubtotalMeasureValue,
    isTableTotalHeaderValue,
} from "@gooddata/sdk-ui";

import { CELL_CLASSNAME, e } from "./bem.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { AgGridRowData } from "../../types/internal.js";
import { getAttributeColIds, parentsMatch } from "../columns/shared.js";
import { isCellDrillable } from "../drilling/isDrillable.js";

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
    const { colDef, data } = params;
    const colId = colDef?.colId ?? colDef?.field;

    if (!colDef || !data || !colId) {
        return CELL_CLASSNAME;
    }

    const colData = data.cellDataByColId?.[colId];

    if (!colData) {
        return CELL_CLASSNAME;
    }

    const isDrillable = isCellDrillable(colDef as AgGridColumnDef, data, drillableItems ?? [], dv);
    const isAttribute = isTableAttributeHeaderValue(colData);
    const isTotal = isTotalValue(colData);
    const isSubtotal = isTableSubtotalMeasureValue(colData);
    const isOverallTotal = isTableOverallTotalMeasureValue(colData);
    const isTotalHeader = isTotalHeaderValue(colData);
    const isNull = isNullValue(colData);
    const isGrouped = isAttributeGroupedCell(params, colId);
    const isSeparated = isGroupFirstRow(params) && !isGrouped;
    const measureIndex = colDef?.context?.measureIndex;

    return cx(
        e("cell", {
            drillable: isDrillable,
            attribute: isAttribute,
            metric: !isAttribute && !isTotalHeader,
            null: isNull,
            total: isTotal,
            subtotal: isSubtotal,
            "overall-total": isOverallTotal,
            "total-header": isTotalHeader,
            grouped: isGrouped,
            separated: isSeparated,
            "first-of-group": measureIndex === 0,
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
    if (!currentRow || currentRow.columnDefinition.type !== "attribute") {
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

const isTotalValue = (colData: ITableDataValue) => {
    return isTableGrandTotalMeasureValue(colData) || isTableGrandTotalSubtotalMeasureValue(colData);
};

const isNullValue = (colData: ITableDataValue) => {
    return !isTableAttributeHeaderValue(colData) && colData.formattedValue === "";
};
