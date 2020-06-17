// (C) 2007-2020 GoodData Corporation
export namespace Execution {
    export interface IMeasureHeaderItem {
        measureHeaderItem: {
            identifier?: string;
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
            localIdentifier: string;
            name: string;
            /* not in new stack yet
            totalItems?: ITotalHeaderItem[]; */
            formOf: {
                identifier: string;
                name: string;
            };
        };
    }

    export type IHeader = IMeasureGroupHeader | IAttributeHeader;

    export interface IResultAttributeHeader {
        attributeHeader: {
            labelValue: string;
            primaryLabelValue?: string;
        };
    }

    export interface IResultMeasureHeader {
        measureHeader: {
            measureIndex: number;
        };
    }

    export interface IResultTotalHeader {
        totalHeader: {
            name: string;
            type: string;
        };
    }

    export interface IDimensionHeader {
        headerGroups: IHeaderGroup[];
    }

    export interface IHeaderGroup {
        headers: IResultHeader[];
    }

    export type IResultHeader = IResultAttributeHeader | IResultMeasureHeader | IResultTotalHeader;

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
        dimensionHeaders?: IDimensionHeader[];
        data: DataValue[][] | DataValue[];
        paging: {
            count: number[];
            offset: number[];
            total: number[];
        };
        /* not yet returned by API
        totals?: DataValue[][][];
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

    export function isResultAttributeHeader(header: IResultHeader): header is IResultAttributeHeader {
        return (header as IResultAttributeHeader).attributeHeader !== undefined;
    }

    export function isResultMeasureHeader(header: IResultHeader): header is IResultMeasureHeader {
        return (header as IResultMeasureHeader).measureHeader !== undefined;
    }

    export function isResultTotalHeader(header: IResultHeader): header is IResultTotalHeader {
        return (header as IResultTotalHeader).totalHeader !== undefined;
    }

    export function isAttributeHeader(header: IHeader): header is IAttributeHeader {
        return (header as IAttributeHeader).attributeHeader !== undefined;
    }

    export function isMeasureGroupHeader(header: IHeader): header is IMeasureGroupHeader {
        return (header as IMeasureGroupHeader).measureGroupHeader !== undefined;
    }
}
