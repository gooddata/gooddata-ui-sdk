// (C) 2019-2025 GoodData Corporation
import {
    IAttributeDescriptor,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultMeasureHeader,
    IResultTotalHeader,
} from "@gooddata/sdk-model";

/**
 * Union of all possible scope types that identify what a specific row or column represents.
 *
 * **Think of scopes as the "address" system for table data:**
 * - Each row has a `rowScope: ITableDataHeaderScope[]` array
 * - Each column has a `columnScope: ITableDataHeaderScope[]` array
 * - These arrays describe the "path" to identify exactly what data belongs in each cell
 *
 * When all scopes are regular scopes (attributes and measures) it represents value column or value row.
 * When scopes are mixed regular and total scopes, it represents subtotal column or subtotal row.
 * When all scopes are total scopes it represents grand total column or grand total row.
 *
 * @alpha
 */
export type ITableDataHeaderScope =
    | ITableDataAttributeScope
    | ITableDataAttributeTotalScope
    | ITableDataMeasureScope
    | ITableDataMeasureTotalScope
    | ITableDataMeasureGroupScope;

/**
 * @alpha
 */
export interface ITableDataAttributeScope {
    type: "attributeScope";
    descriptor: IAttributeDescriptor;
    header: IResultAttributeHeader;
}

/**
 * @alpha
 */
export interface ITableDataMeasureScope {
    type: "measureScope";
    descriptor: IMeasureDescriptor;
    header: IResultMeasureHeader;
}

/**
 * @alpha
 */
export interface ITableDataMeasureTotalScope {
    type: "measureTotalScope";
    descriptor: IMeasureDescriptor;
    header: IResultTotalHeader;
}

/**
 * @alpha
 */
export interface ITableDataAttributeTotalScope {
    type: "attributeTotalScope";
    descriptor: IAttributeDescriptor;
    header: IResultTotalHeader;
}

/**
 * @alpha
 */
export interface ITableDataMeasureGroupScope {
    type: "measureGroupScope";
    descriptor: IMeasureGroupDescriptor;
}
