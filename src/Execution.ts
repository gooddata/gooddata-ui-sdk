export namespace Execution {
    export interface IMeasureHeaderItem {
        measureHeaderItem: {
            uri?: string;
            identifier?: string;
            localIdentifier: string;
            name: string;
            format: string;
        }
    }

    export interface ITotalHeaderItem {
        totalHeaderItem: {
            name: string;
        }
    }

    export interface IMeasureGroupHeader {
        measureGroupHeader: {
            items: IMeasureHeaderItem[];
            totalItems?: ITotalHeaderItem[];
        }
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
        }
    }

    export type IHeader = IMeasureGroupHeader | IAttributeHeader;

    export interface IResultAttributeHeaderItem {
        attributeHeaderItem: {
            uri: string;
            name: string;
        }
    }

    export interface IResultMeasureHeaderItem {
        measureHeaderItem: {
            name: string,
            order: number
        }
    }

    export interface IResultTotalHeaderItem {
        totalHeaderItem: {
            name: string,
            type: string
        }
    }

    export type IResultHeaderItem = IResultAttributeHeaderItem | IResultMeasureHeaderItem | IResultTotalHeaderItem;

    export interface IResultDimension {
        headers: IHeader[];
    }

    export interface IExecutionResponse {
        executionResponse: {
            links: {
                executionResult: string;
            };
            dimensions: IResultDimension[];
        }
    }

    export type DataValue = null | string | number;

    export interface Warning {
        warningCode: string;
        message: string;
        parameters?: any[];
    }

    export interface IExecutionResult {
        executionResult: {
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
}
