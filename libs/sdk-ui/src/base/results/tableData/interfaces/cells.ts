// (C) 2019-2025 GoodData Corporation
import {
    DataValue,
    IMeasureDescriptor,
    IAttributeDescriptor,
    IResultAttributeHeader,
    IResultMeasureHeader,
    IResultTotalHeader,
    TotalType,
} from "@gooddata/sdk-model";
import {
    ITableGrandTotalRowDefinition,
    ITableRowDefinition,
    ITableSubtotalRowDefinition,
    ITableValueRowDefinition,
} from "./rows.js";
import {
    ITableAttributeColumnDefinition,
    ITableColumnDefinition,
    ITableGrandTotalColumnDefinition,
    ITableMeasureGroupValueColumnDefinition,
    ITableSubtotalColumnDefinition,
    ITableValueColumnDefinition,
} from "./columns.js";

/**
 * @alpha
 */
export type ITableDataValue =
    | ITableAttributeHeaderValue
    | ITableMeasureHeaderValue
    | ITableTotalHeaderValue
    | ITableMeasureValue
    | ITableSubtotalMeasureValue
    | ITableGrandTotalHeaderValue
    | ITableGrandTotalMeasureValue
    | ITableGrandTotalSubtotalMeasureValue
    | ITableOverallTotalMeasureValue;

/**
 * @alpha
 */
export interface ITableAttributeHeaderValue {
    type: "attributeHeader";
    formattedValue: string | null;
    value: IResultAttributeHeader;
    rowIndex: number;
    columnIndex: number;
    rowDefinition: ITableRowDefinition;
    columnDefinition: ITableAttributeColumnDefinition;
}

/**
 * @alpha
 */
export interface ITableMeasureHeaderValue {
    type: "measureHeader";
    formattedValue: string | null;
    value: IResultMeasureHeader;
    rowIndex: number;
    columnIndex: number;
    rowDefinition: ITableRowDefinition;
    columnDefinition: ITableColumnDefinition;
}

/**
 * @alpha
 */
export interface ITableTotalHeaderValue {
    type: "totalHeader";
    formattedValue: string | null;
    value: IResultTotalHeader;
    rowIndex: number;
    columnIndex: number;
    rowDefinition: ITableRowDefinition;
    columnDefinition: ITableColumnDefinition;
}

/**
 * @alpha
 */
export interface ITableMeasureValue {
    type: "value";
    formattedValue: string | null;
    value: DataValue;
    rowIndex: number;
    columnIndex: number;
    rowDefinition: ITableValueRowDefinition | ITableSubtotalRowDefinition;
    columnDefinition: ITableValueColumnDefinition | ITableMeasureGroupValueColumnDefinition;
}

/**
 * @alpha
 */
export interface ITableSubtotalMeasureValue {
    type: "subtotalValue";
    formattedValue: string | null;
    value: DataValue;
    rowIndex: number;
    columnIndex: number;
    rowDefinition: ITableValueRowDefinition | ITableSubtotalRowDefinition;
    columnDefinition: ITableValueColumnDefinition | ITableSubtotalColumnDefinition;
}

/**
 * @alpha
 */
export interface ITableGrandTotalMeasureValue {
    type: "grandTotalValue";
    formattedValue: string | null;
    value: DataValue;
    rowIndex: number;
    columnIndex: number;
    rowDefinition: ITableRowDefinition;
    columnDefinition: ITableColumnDefinition;
    grandTotalInfo?: {
        type: TotalType;
        measure: IMeasureDescriptor;
        attribute: IAttributeDescriptor;
    };
}

/**
 * @alpha
 */
export interface ITableGrandTotalSubtotalMeasureValue {
    type: "grandTotalSubtotalValue";
    formattedValue: string | null;
    value: DataValue;
    rowIndex: number;
    columnIndex: number;
    rowDefinition: ITableRowDefinition;
    columnDefinition: ITableColumnDefinition;
    grandTotalInfo?: {
        type: TotalType;
        measure: IMeasureDescriptor;
        attribute: IAttributeDescriptor;
    };
}

/**
 * @alpha
 */
export interface ITableOverallTotalMeasureValue {
    type: "overallTotalValue";
    formattedValue: string | null;
    value: DataValue;
    rowIndex: number;
    columnIndex: number;
    rowDefinition: ITableGrandTotalRowDefinition;
    columnDefinition: ITableGrandTotalColumnDefinition;
    grandTotalInfo?: {
        type: TotalType;
        measure: IMeasureDescriptor;
        attribute: IAttributeDescriptor;
    };
}

/**
 * @alpha
 */
export interface ITableGrandTotalHeaderValue {
    type: "grandTotalHeader";
    formattedValue: string | null;
    rowIndex: number;
    columnIndex: number;
    rowDefinition: ITableRowDefinition;
    columnDefinition: ITableColumnDefinition;
    grandTotalInfo?: {
        type: TotalType;
        measure: IMeasureDescriptor;
        attribute: IAttributeDescriptor;
    };
}
