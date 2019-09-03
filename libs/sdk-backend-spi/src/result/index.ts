// (C) 2019 GoodData Corporation

import { IExportConfig, IExportResult } from "../export";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IExecutionResult {
    /**
     * Unique identifier of the execution result.
     */
    readonly id: string;
    readonly dimensions: IResultDimension[];

    readAll(): Promise<IDataView>;

    readView(offset: number[], limit: number[]): Promise<IDataView>;

    export(options: IExportConfig): Promise<IExportResult>;

    equals(other: IExecutionResult): boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IDataView {
    readonly offset: number[];
    readonly limit: number[];
    readonly headerItems?: IResultHeaderItem[][][];
    readonly data: DataValue[][] | DataValue[];
    readonly totals?: DataValue[][][];

    next(...dims: boolean[]): Promise<IDataView | null>;

    pageUp(): Promise<IDataView | null>;

    pageDown(): Promise<IDataView | null>;

    pageLeft(): Promise<IDataView | null>;

    pageRight(): Promise<IDataView | null>;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export type DataValue = null | string | number;

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IMeasureHeaderItem {
    measureHeaderItem: {
        uri?: string;
        identifier?: string;
        localIdentifier: string;
        name: string;
        format: string;
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface ITotalHeaderItem {
    totalHeaderItem: {
        name: string;
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IMeasureGroupHeader {
    measureGroupHeader: {
        items: IMeasureHeaderItem[];
        totalItems?: ITotalHeaderItem[];
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IAttributeHeader {
    attributeHeader: {
        uri: string;
        identifier: string;
        localIdentifier: string;
        name: string;
        totalItems?: ITotalHeaderItem[];
        formOf: {
            uri: string;
            identifier: string;
            name: string;
        };
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export type IHeader = IMeasureGroupHeader | IAttributeHeader;

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IResultDimension {
    headers: IHeader[];
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IResultAttributeHeaderItem {
    attributeHeaderItem: {
        uri: string;
        name: string;
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IResultMeasureHeaderItem {
    measureHeaderItem: {
        name: string;
        order: number;
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IResultTotalHeaderItem {
    totalHeaderItem: {
        name: string;
        type: string;
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export type IResultHeaderItem =
    | IResultAttributeHeaderItem
    | IResultMeasureHeaderItem
    | IResultTotalHeaderItem;
