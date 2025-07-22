// (C) 2019-2025 GoodData Corporation
import {
    IMeasureDescriptor,
    IAttributeDescriptor,
    IResultAttributeHeader,
    IResultMeasureHeader,
    IResultTotalHeader,
    IMeasureGroupDescriptor,
} from "@gooddata/sdk-model";

/**
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
