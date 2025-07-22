// (C) 2019-2025 GoodData Corporation
import { IAttributeDescriptor, IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { ITableDataHeaderScope } from "./scope.js";

/**
 * @alpha
 */
export type ITableColumnDefinition =
    | ITableAttributeColumnDefinition
    | ITableValueColumnDefinition
    | ITableMeasureGroupHeaderColumnDefinition
    | ITableMeasureGroupValueColumnDefinition
    | ITableSubtotalColumnDefinition
    | ITableGrandTotalColumnDefinition;

/**
 * @alpha
 */
export interface ITableAttributeColumnDefinition {
    type: "attribute";
    columnIndex: number;
    rowHeaderIndex: number;
    attributeDescriptor: IAttributeDescriptor;
}

/**
 * @alpha
 */
export interface ITableValueColumnDefinition {
    type: "value";
    columnIndex: number;
    columnHeaderIndex: number;
    columnScope: ITableDataHeaderScope[];
}

/**
 * @alpha
 */
export interface ITableMeasureGroupHeaderColumnDefinition {
    type: "measureGroupHeader";
    columnIndex: number;
    measureGroupDescriptor: IMeasureGroupDescriptor;
    attributeDescriptors: IAttributeDescriptor[];
}

/**
 * @alpha
 */
export interface ITableMeasureGroupValueColumnDefinition {
    type: "measureGroupValue";
    columnIndex: number;
    measureGroupDescriptor: IMeasureGroupDescriptor;
}

/**
 * @alpha
 */
export interface ITableSubtotalColumnDefinition {
    type: "subtotal";
    columnIndex: number;
    columnHeaderIndex: number;
    columnScope: ITableDataHeaderScope[];
}

/**
 * @alpha
 */
export interface ITableGrandTotalColumnDefinition {
    type: "grandTotal";
    columnIndex: number;
    columnHeaderIndex: number;
    columnScope: ITableDataHeaderScope[];
}
