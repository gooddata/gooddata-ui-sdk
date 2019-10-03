// (C) 2007-2019 GoodData Corporation
export namespace Execution {
    export interface IMeasureHeaderItem {
        measureHeaderItem: {
            /* not in new stack yet
            identifier?: string;
            */
            format: string;
            localIdentifier: string;
            name: string;
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
            // not in new stack yet
            // totalItems?: ITotalHeaderItem[];
        };
    }

    export interface IAttributeHeader {
        attributeHeader: {
            identifier: string;
            /* not in new stack yet
            localIdentifier: string;
            name: string;
            totalItems?: ITotalHeaderItem[];
            formOf: {
                identifier: string;
                name: string;
            };*/
        };
    }

    export type IHeader = IMeasureGroupHeader | IAttributeHeader;

    export interface IResultAttributeHeaderItem {
        attributeHeaderItem: {
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
        executionResponse: {
            links: {
                executionResult: string;
            };
            dimensions: IResultDimension[];
        };
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
        /* not yet returned by API
        totals?: DataValue[][][];
        paging: {
            count: number[];
            offset: number[];
            total: number[];
        };
        warnings?: Warning[];*/
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
        return (header as IResultAttributeHeaderItem).attributeHeaderItem !== undefined;
    }

    export function isMeasureHeaderItem(header: IResultHeaderItem): header is IResultMeasureHeaderItem {
        return (header as IResultMeasureHeaderItem).measureHeaderItem !== undefined;
    }

    export function isTotalHeaderItem(header: IResultHeaderItem): header is IResultTotalHeaderItem {
        return (header as IResultTotalHeaderItem).totalHeaderItem !== undefined;
    }

    export function isAttributeHeader(header: IHeader): header is IAttributeHeader {
        return (header as IAttributeHeader).attributeHeader !== undefined;
    }

    export function isMeasureGroupHeader(header: IHeader): header is IMeasureGroupHeader {
        return (header as IMeasureGroupHeader).measureGroupHeader !== undefined;
    }
}
