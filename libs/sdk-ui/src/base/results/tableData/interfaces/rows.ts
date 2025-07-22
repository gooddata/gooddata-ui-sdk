// (C) 2019-2025 GoodData Corporation
import { IMeasureDescriptor, IAttributeDescriptor, TotalType } from "@gooddata/sdk-model";
import { ITableDataHeaderScope } from "./scope.js";

/**
 * @alpha
 */
export type ITableRowDefinition =
    | ITableValueRowDefinition
    | ITableSubtotalRowDefinition
    | ITableGrandTotalRowDefinition;

/**
 * @alpha
 */
export interface ITableValueRowDefinition {
    type: "value";
    rowIndex: number;
    rowScope: ITableDataHeaderScope[];
}
/**
 * @alpha
 */
export interface ITableSubtotalRowDefinition {
    type: "subtotal";
    rowIndex: number;
    rowScope: ITableDataHeaderScope[];
}

/**
 * @alpha
 */
export interface ITableGrandTotalRowDefinition {
    type: "grandTotal";
    rowIndex: number;
    attributeDescriptor: IAttributeDescriptor;
    measureDescriptors: IMeasureDescriptor[];
    totalType: TotalType;
    rowGrandTotalIndex: number;
}
