// (C) 2007-2018 GoodData Corporation
import isEmpty from "lodash/isEmpty";

/**
 * @public
 */
export namespace GdcExecution {
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

    export interface IResultDimension {
        headers: IHeader[];
    }

    export interface IExecutionResponse {
        links: {
            executionResult: string;
        };
        dimensions: IResultDimension[];
    }

    export interface IExecutionResponseWrapper {
        executionResponse: IExecutionResponse;
    }

    export type DataValue = null | string | number;

    // tslint:disable-next-line:interface-name
    export interface Warning {
        warningCode: string;
        message: string;
        parameters?: any[];
    }

    export interface IExecutionResult {
        headerItems?: IResultHeaderItem[][][];
        data: DataValue[][] | DataValue[];
        totals?: DataValue[][][];
        paging: {
            count: number[];
            offset: number[];
            total: number[];
        };
        warnings?: Warning[];
    }

    export interface IExecutionResultWrapper {
        executionResult: IExecutionResult;
    }

    export interface IError extends Error {
        response: Response;
    }

    /**
     * Combination of both AFM executions responses
     *
     * `null` value as executionResult means empty response (HTTP 204)
     */
    export interface IExecutionResponses {
        executionResponse: IExecutionResponse;
        executionResult: IExecutionResult | null;
    }

    export function isAttributeHeaderItem(header: IResultHeaderItem): header is IResultAttributeHeaderItem {
        return !isEmpty(header) && (header as IResultAttributeHeaderItem).attributeHeaderItem !== undefined;
    }

    export function isMeasureHeaderItem(header: IResultHeaderItem): header is IResultMeasureHeaderItem {
        return !isEmpty(header) && (header as IResultMeasureHeaderItem).measureHeaderItem !== undefined;
    }

    export function isTotalHeaderItem(header: IResultHeaderItem): header is IResultTotalHeaderItem {
        return !isEmpty(header) && (header as IResultTotalHeaderItem).totalHeaderItem !== undefined;
    }

    export function isAttributeHeader(header: IHeader): header is IAttributeHeader {
        return !isEmpty(header) && (header as IAttributeHeader).attributeHeader !== undefined;
    }

    export function isMeasureGroupHeader(header: IHeader): header is IMeasureGroupHeader {
        return !isEmpty(header) && (header as IMeasureGroupHeader).measureGroupHeader !== undefined;
    }
}
