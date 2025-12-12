// (C) 2025 GoodData Corporation

import { type IRowNode, type ValueGetterParams } from "ag-grid-enterprise";
import { type IntlShape } from "react-intl";

import { type IResultAttributeHeader, type IResultTotalHeader, type TotalType } from "@gooddata/sdk-model";
import {
    type ITableAttributeColumnDefinition,
    type ITableDataValue,
    emptyHeaderTitleFromIntl,
    isTableGrandTotalHeaderValue,
    isTableGrandTotalMeasureValue,
    isTableGrandTotalSubtotalMeasureValue,
    isTableOverallTotalMeasureValue,
    isTableSubtotalMeasureValue,
    isTableTotalHeaderValue,
} from "@gooddata/sdk-ui";

import { totalTypeMessages } from "../../../locales.js";
import { type AgGridCellRendererParams } from "../../types/agGrid.js";
import { type AgGridRowData } from "../../types/internal.js";

export { isTableGrandTotalHeaderValue, isTableTotalHeaderValue };

export const isTableTotalCellData = (cellData: ITableDataValue | undefined) => {
    if (!cellData) {
        return false;
    }

    return (
        isTableSubtotalMeasureValue(cellData) ||
        isTableGrandTotalMeasureValue(cellData) ||
        isTableGrandTotalSubtotalMeasureValue(cellData) ||
        isTableOverallTotalMeasureValue(cellData)
    );
};

/**
 * Extracts formatted value from cell data.
 *
 * @internal
 */
export function extractFormattedValue(
    params: ValueGetterParams<AgGridRowData, string | null> | IRowNode<AgGridRowData> | null | undefined,
    colId: string,
): string | null {
    const cell = params?.data?.cellDataByColId?.[colId];

    if (!cell) {
        return null;
    }

    return cell.formattedValue;
}

/**
 * Extracts translated formatted value from cell data.
 *
 * @internal
 */
export function extractIntlFormattedValue(
    params: ValueGetterParams<AgGridRowData, string | null> | IRowNode<AgGridRowData> | null | undefined,
    colId: string,
    intl: IntlShape,
): string | null {
    const cell = params?.data?.cellDataByColId?.[colId];

    if (!cell) {
        return null;
    }

    return isTableGrandTotalHeaderValue(cell) || isTableTotalHeaderValue(cell)
        ? (translateTotalValue(cell.formattedValue as TotalType, intl) ?? cell.formattedValue)
        : cell.formattedValue;
}

/**
 * Extracts translated formatted value from total header.
 *
 * @internal
 */
export function extractIntlTotalHeaderValue(header: IResultTotalHeader, intl: IntlShape): string {
    const totalType = header.totalHeaderItem.name as TotalType;

    return translateTotalValue(totalType, intl) ?? totalType;
}

function translateTotalValue(totalType: TotalType | null, intl: IntlShape) {
    if (!totalType) {
        return null;
    }

    const message = totalTypeMessages[totalType];
    return message ? intl.formatMessage(message) : totalType;
}

/**
 * Determines if an attribute should be grouped (not rendered) based on hierarchical comparison.
 *
 * For hierarchical attributes, we only group if ALL parent attributes (attributes with lower columnIndex)
 * have the same values in both current and previous rows.
 *
 * @param params - Current cell renderer params
 * @param previousRow - Previous row data
 * @param columnDefinition - Current column definition
 * @returns True if the attribute should be grouped (not rendered)
 */
export function shouldGroupAttribute(
    params: AgGridCellRendererParams,
    previousRow: any,
    columnDefinition: ITableAttributeColumnDefinition,
): boolean {
    const { data } = params;
    const currentColumnIndex = columnDefinition.columnIndex;

    // Ensure all parent attributes (lower columnIndex) match between current and previous rows
    if (!parentsMatch(data, previousRow?.data, currentColumnIndex)) {
        return false;
    }

    // If all parent attributes match, check if the current attribute value matches
    const currentValue = params.value;
    const previousValue = extractFormattedValue(
        previousRow,
        columnDefinition.attributeDescriptor.attributeHeader.localIdentifier,
    );

    return currentValue === previousValue && currentValue !== undefined && currentValue !== "";
}

/**
 * Returns column IDs of attribute columns present in the row.
 *
 * @internal
 */
export function getAttributeColIds(rowData?: AgGridRowData): string[] {
    const cellDataByColId = rowData?.cellDataByColId ?? {};
    return Object.keys(cellDataByColId).filter((key) => {
        const cellData = cellDataByColId[key];
        return cellData?.columnDefinition?.type === "attribute";
    });
}

/**
 * Checks whether all parent attributes (with lower columnIndex than currentColumnIndex)
 * have identical formatted values in both rows.
 *
 * @internal
 */
export function parentsMatch(
    currentRow: AgGridRowData | undefined,
    compareRow: AgGridRowData | undefined,
    currentColumnIndex: number,
): boolean {
    if (!currentRow?.cellDataByColId) {
        return true;
    }

    const attributeColIds = getAttributeColIds(currentRow);

    for (const attrColId of attributeColIds) {
        const cellData = currentRow.cellDataByColId[attrColId];
        if (!cellData || cellData.columnDefinition?.type !== "attribute") {
            continue;
        }

        const attrColumnIndex = cellData.columnDefinition.columnIndex;

        if (attrColumnIndex >= currentColumnIndex) {
            continue;
        }

        const currentValue = cellData.formattedValue;
        const compareValue = compareRow?.cellDataByColId?.[attrColId]?.formattedValue;

        if (currentValue !== compareValue) {
            return false;
        }
    }

    return true;
}

/**
 * Gets the name of the attribute header.
 *
 * We nullify empty string as otherwise it would be displayed as "" instead of "(empty value)".
 *
 * Generally, both "" and null are supported by BE, but we want to display "(empty value)" for both.
 *
 * @param attributeHeader - The attribute header.
 * @param intl - The intl instance.
 * @returns The name of the attribute header.
 */
export function getAttributeHeaderName(attributeHeader: IResultAttributeHeader, intl: IntlShape) {
    return (
        convertEmptyStringToNull(attributeHeader.attributeHeaderItem.formattedName) ??
        convertEmptyStringToNull(attributeHeader.attributeHeaderItem.name) ??
        emptyHeaderTitleFromIntl(intl)
    );
}

/**
 * Converts empty string to null.
 *
 * @param value - The value to convert.
 * @returns The converted value.
 */
export function convertEmptyStringToNull(value: string | null | undefined) {
    return value === "" ? null : value;
}
