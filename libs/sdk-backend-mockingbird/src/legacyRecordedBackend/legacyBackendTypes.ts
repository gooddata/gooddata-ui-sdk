// (C) 2019-2024 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";

export interface IMeasureHeaderItem {
    measureHeaderItem: {
        uri?: string;
        identifier?: string;
        localIdentifier: string;
        name: string;
        format: string;
    };
}

export interface ITotalHeaderItem {
    totalHeaderItem: {
        name: string;
    };
}

export interface IMeasureGroupHeader {
    measureGroupHeader: {
        items: IMeasureHeaderItem[];
        totalItems?: ITotalHeaderItem[];
    };
}

/**
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

export type IHeader = IMeasureGroupHeader | IAttributeHeader;

export interface IResultDimension {
    headers: IHeader[];
}

export type DataValue = null | string | number;

export interface IResultAttributeHeaderItem {
    attributeHeaderItem: {
        uri: string;
        name: string;
    };
}

export interface IResultMeasureHeaderItem {
    measureHeaderItem: {
        name: string;
        order: number;
    };
}

export interface IResultTotalHeaderItem {
    totalHeaderItem: {
        name: string;
        type: string;
    };
}

export type IResultHeaderItem =
    | IResultAttributeHeaderItem
    | IResultMeasureHeaderItem
    | IResultTotalHeaderItem;

export interface Warning {
    warningCode: string;
    message: string;
    parameters?: any[];
}

export interface IExecutionResult {
    headerItems?: IResultHeaderItem[][][];
    data: DataValue[][] | DataValue[];
    totals?: DataValue[][][];
    totalTotals?: DataValue[][][];
    paging: {
        count: number[];
        offset: number[];
        total: number[];
    };
    warnings?: Warning[];
}

export interface IExecutionResponse {
    links: {
        executionResult: string;
    };
    dimensions: IResultDimension[];
}

export function isAttributeHeaderItem(header: IResultHeaderItem): header is IResultAttributeHeaderItem {
    return !isEmpty(header) && (header as IResultAttributeHeaderItem).attributeHeaderItem !== undefined;
}

export function isAttributeHeader(header: IHeader): header is IAttributeHeader {
    return !isEmpty(header) && (header as IAttributeHeader).attributeHeader !== undefined;
}
