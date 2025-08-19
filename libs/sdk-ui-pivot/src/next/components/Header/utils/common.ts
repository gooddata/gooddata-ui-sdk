// (C) 2025 GoodData Corporation

import { IAttributeDescriptor } from "@gooddata/sdk-model";
import {
    isMeasureGroupHeaderColumnDefinition,
    isValueColumnDefinition,
    isValueRowDefinition,
    ITableColumnDefinition,
    ITableDataHeaderScope,
    ITableRowDefinition,
} from "@gooddata/sdk-ui";

/**
 * Checks if a column definition is value column definition
 *
 * @param columnDef - The column definition
 * @returns true if the column definition is aggregable, false otherwise
 */
export const isValueColumnDef = (columnDef: ITableColumnDefinition | undefined) => {
    if (!columnDef) {
        return false;
    }

    return isValueColumnDefinition(columnDef);
};

/**
 * Checks if a row definition is value row definition
 *
 * @param rowDef - The row definition
 * @returns true if the row definition is value row definition, false otherwise
 */
export const isValueRowDef = (rowDef: ITableRowDefinition | undefined) => {
    if (!rowDef) {
        return false;
    }

    return isValueRowDefinition(rowDef);
};

/**
 * Gets the column scope for a column definition.
 *
 * @param columnDefinition - The column definition
 * @returns The column scope
 */
export const getColumnScope = (columnDefinition: ITableColumnDefinition | undefined) => {
    if (columnDefinition && isValueColumnDefinition(columnDefinition)) {
        return columnDefinition.columnScope;
    }

    return [];
};

/**
 * Gets the row scope for a row definition.
 *
 * @param rowDefinition - The row definition
 * @returns The row scope
 */
export const getRowScope = (rowDefinition: ITableRowDefinition | undefined) => {
    if (rowDefinition && isValueRowDefinition(rowDefinition)) {
        return rowDefinition.rowScope;
    }

    return [];
};

/**
 * Gets the measure identifier for a column scope.
 *
 * @param columnScope - The column scope
 * @returns The measure identifier
 */
export const getColumnMeasureIdentifier = (columnScope: ITableDataHeaderScope[]) => {
    const measure = columnScope.find((scope) => scope.type === "measureScope");

    return measure?.descriptor.measureHeaderItem.localIdentifier;
};

/**
 * Gets the attribute descriptors for a pivot group header column definition.
 *
 * @param columnScope - The column scope
 * @returns The attribute descriptors
 */
export const getPivotAttributeDescriptors = (columnScope: ITableDataHeaderScope[]) => {
    return columnScope.filter((scope) => scope.type === "attributeScope").map(({ descriptor }) => descriptor);
};

/**
 * Gets the attribute descriptors for a measure group header column definition.
 *
 * @param columnDefinition - The column definition
 * @returns The attribute descriptors
 */
export const getPivotAttributeDescriptorsForMeasureGroup = (
    columnDefinition: ITableColumnDefinition | undefined,
) => {
    if (columnDefinition && isMeasureGroupHeaderColumnDefinition(columnDefinition)) {
        return columnDefinition.attributeDescriptors;
    }

    return [];
};

/**
 * Subtotals within a certain attribute are titled by the previous attribute header.
 *
 * @param attributeLocalIdentifier - The local identifier of the attribute
 * @param descriptors - The descriptors of the attributes
 * @returns The name of the previous attribute header
 */
export const getPreviousAttributeHeaderName = (
    attributeLocalIdentifier: string,
    descriptors: IAttributeDescriptor[],
) => {
    const index = descriptors.findIndex(
        (descriptor) => descriptor.attributeHeader.localIdentifier === attributeLocalIdentifier,
    );
    return descriptors[index - 1]?.attributeHeader.name;
};
