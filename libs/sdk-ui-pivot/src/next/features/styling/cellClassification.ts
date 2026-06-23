// (C) 2026 GoodData Corporation

import {
    type ITableDataValue,
    isGrandTotalRowDefinition,
    isSubtotalRowDefinition,
    isTableAttributeHeaderValue,
    isTableGrandTotalHeaderValue,
    isTableGrandTotalMeasureValue,
    isTableGrandTotalSubtotalMeasureValue,
    isTableOverallTotalMeasureValue,
    isTableSubtotalMeasureValue,
    isTableTotalHeaderValue,
} from "@gooddata/sdk-ui";

/**
 * True for any subtotal / grand-total / overall-total cell.
 *
 * Single source of truth for "is this a total cell". Two independent ways a cell can be a total:
 * its own value/header type (which also covers subtotal/grand-total *columns*), or — the transposed
 * case — a plain `type:"value"` cell sitting on a subtotal/grand-total *row*.
 *
 * @internal
 */
export function isTotalCell(cellData: ITableDataValue): boolean {
    if (
        isTableSubtotalMeasureValue(cellData) ||
        isTableGrandTotalMeasureValue(cellData) ||
        isTableGrandTotalSubtotalMeasureValue(cellData) ||
        isTableOverallTotalMeasureValue(cellData) ||
        isTableTotalHeaderValue(cellData) ||
        isTableGrandTotalHeaderValue(cellData)
    ) {
        return true;
    }

    return (
        "rowDefinition" in cellData &&
        (isSubtotalRowDefinition(cellData.rowDefinition) || isGrandTotalRowDefinition(cellData.rowDefinition))
    );
}

/**
 * True for an empty/null cell: a non-attribute cell whose value renders as an empty formatted string.
 *
 * @internal
 */
export function isEmptyCell(cellData: ITableDataValue): boolean {
    return !isTableAttributeHeaderValue(cellData) && cellData.formattedValue === "";
}
