// Copyright (C) 2007-2018, GoodData(R) Corporation. All rights reserved.
import * as invariant from 'invariant';
import * as qs from 'qs';
import { get, range } from 'lodash';
import { Execution, AFM } from '@gooddata/typings';

import { XhrModule } from '../xhr';

export const DEFAULT_LIMIT = 500;

export class ExecuteAfmModule {
    constructor(private xhr: XhrModule) {
    }

    /**
     * Execute AFM and fetch all data results
     *
     * @method executeAfm
     * @param {String} projectId - GD project identifier
     * @param {AFM.IExecution} execution - See https://github.com/gooddata/gooddata-typings/blob/v2.1.0/src/AFM.ts#L2
     *
     * @returns {Promise<Execution.IExecutionResponses>} Structure with `executionResponse` and `executionResult` -
     *  See https://github.com/gooddata/gooddata-typings/blob/v2.1.0/src/Execution.ts#L113
     */
    public executeAfm(projectId: string, execution: AFM.IExecution)
        : Promise<Execution.IExecutionResponses> {
        validateNumOfDimensions(get(execution, 'execution.resultSpec.dimensions').length);
        return this.getExecutionResponse(projectId, execution)
            .then((executionResponse: Execution.IExecutionResponse) => {
                return this.getExecutionResult(executionResponse.links.executionResult)
                    .then((executionResult: Execution.IExecutionResult | null) => {
                        return { executionResponse, executionResult };
                    });
            });
    }

    /**
     * Get Response from Execution
     *
     * @method getExecutionResponse
     * @param {string} projectId - GD project identifier
     * @param {AFM.IExecution} execution - See https://github.com/gooddata/gooddata-typings/blob/v2.1.0/src/AFM.ts#L2
     *
     * @returns {Promise<Execution.IExecutionResponse>} Promise with `executionResponse`
     *  See https://github.com/gooddata/gooddata-typings/blob/v2.1.0/src/Execution.ts#L69
     */
    private getExecutionResponse(projectId: string, execution: AFM.IExecution)
        : Promise<Execution.IExecutionResponse> {
        validateNumOfDimensions(get(execution, 'execution.resultSpec.dimensions').length);
        return this.xhr.post(`/gdc/app/projects/${projectId}/executeAfm`, { body: JSON.stringify(execution) })
            .then(apiResponse => apiResponse.getData())
            .then(unwrapExecutionResponse);
    }

    /**
     * Get whole ExecutionResult
     *
     * @method getExecutionResult
     * @param {string} executionResultUri
     *
     * @returns {Promise<Execution.IExecutionResult | null>}
     *  Promise with `executionResult` or `null` (null means empty response - HTTP 204)
     *  See https://github.com/gooddata/gooddata-typings/blob/v2.1.0/src/Execution.ts#L88
     */
    private getExecutionResult(executionResultUri: string)
        : Promise<Execution.IExecutionResult | null> {
        const numOfDimensions = Number(qs.parse(executionResultUri).dimensions);
        validateNumOfDimensions(numOfDimensions);

        const limit = Array(numOfDimensions).fill(DEFAULT_LIMIT);
        const offset = Array(numOfDimensions).fill(0);

        return this.getAllPages(executionResultUri, limit, offset);
    }

    private getAllPages(
        executionResultUri: string,
        limit: number[],
        offset: number[],
        prevExecutionResult?: Execution.IExecutionResult
    ): Promise<Execution.IExecutionResult | null> {
        return this.fetchExecutionResult(executionResultUri, limit, offset)
            .then((executionResultWrapper: Execution.IExecutionResultWrapper | null) => {
                if (!executionResultWrapper) {
                    return null;
                }

                const executionResult = unwrapExecutionResult(executionResultWrapper);

                const newExecutionResult = prevExecutionResult
                    ? mergePage(prevExecutionResult, executionResult)
                    : executionResult;

                const { offset, total } = executionResult.paging;
                const nextOffset = getNextOffset(limit, offset, total);
                const nextLimit = getNextLimit(limit, nextOffset, total);

                return nextPageExists(nextOffset, total)
                    ? this.getAllPages(executionResultUri, nextLimit, nextOffset, newExecutionResult)
                    : newExecutionResult;
            });
    }

    private fetchExecutionResult(executionResultUri: string, limit: number[], offset: number[])
        : Promise<Execution.IExecutionResultWrapper | null> {
        const uri = replaceLimitAndOffsetInUri(executionResultUri, limit, offset);

        return this.xhr.ajax(uri, { method: 'GET' })
            .then((apiResponse) => {
                if (apiResponse.response.status === 204) {
                    return null;
                }
                return apiResponse.getData();
            });
    }
}

function unwrapExecutionResponse(executionResponseWrapper: Execution.IExecutionResponseWrapper)
    : Execution.IExecutionResponse {
    return executionResponseWrapper.executionResponse;
}

function unwrapExecutionResult(executionResultWrapper: Execution.IExecutionResultWrapper)
    : Execution.IExecutionResult {
    return executionResultWrapper.executionResult;
}

function validateNumOfDimensions(numOfDimensions: number): void {
    invariant(
        numOfDimensions === 1 || numOfDimensions === 2,
        `${numOfDimensions} dimensions are not allowed. Only 1 or 2 dimensions are supported.`
    );
}

export function replaceLimitAndOffsetInUri(oldUri: string, limit: number[], offset: number[]): string {
    const [uriPart, queryPart] = oldUri.split(/\?(.+)/);
    const query = {
        ...qs.parse(queryPart),
        limit: limit.join(','),
        offset: offset.join(',')
    };

    return uriPart + qs.stringify(query, { addQueryPrefix: true });
}

export function getNextOffset(limit: number[], offset: number[], total: number[]): number[] {
    const numOfDimensions = total.length;
    const defaultNextRowsOffset = offset[0] + limit[0];

    if (numOfDimensions === 1) {
        return [defaultNextRowsOffset];
    }

    const defaultNextColumnsOffset = offset[1] + limit[1];
    const nextColumnsExist = offset[1] + limit[1] < total[1];

    const nextRowsOffset = nextColumnsExist
        ? offset[0] // stay in the same rows
        : defaultNextRowsOffset; // go to the next rows

    const nextColumnsOffset = nextColumnsExist
        ? defaultNextColumnsOffset // next columns for the same rows
        : 0; // start in the beginning of the next rows

    return [nextRowsOffset, nextColumnsOffset];
}

export function getNextLimit(limit: number[], nextOffset: number[], total: number[]): number[] {
    const numOfDimensions = total.length;
    validateNumOfDimensions(numOfDimensions);

    const getSingleNextLimit = (limit: number, nextOffset: number, total: number): number => nextOffset + limit > total
        ? total - nextOffset
        : limit;

    // prevent set up lower limit than possible for 2nd dimension in the beginning of the next rows
    if (
        numOfDimensions === 2 &&
        nextOffset[1] === 0 && // beginning of the next rows
        limit[0] < total[1] // limit from 1st dimension should be used in 2nd dimension
    ) {
        return [
            getSingleNextLimit(limit[0], nextOffset[0], total[0]),
            limit[0]
        ];
    }

    return range(numOfDimensions).map((i: number) => getSingleNextLimit(limit[i], nextOffset[i], total[i]));
}

export function nextPageExists(nextOffset: number[], total: number[]): boolean {
    // expression "return nextLimit[0] > 0" also returns correct result
    return nextOffset[0] < total[0];
}

// works only for one or two dimensions
export function mergePage(
    prevExecutionResult: Execution.IExecutionResult,
    executionResult: Execution.IExecutionResult
): Execution.IExecutionResult {
    const result = prevExecutionResult;
    const { headerItems, data, paging } = executionResult;

    const mergeHeaderItems = (dimension: number) => {
        // for 1 dimension we already have the headers from first page
        const otherDimension = dimension === 0 ? 1 : 0;
        const isEdge = (paging.offset[otherDimension] === 0);
        if (isEdge && headerItems && result.headerItems) {
            for (let attrIdx = 0; attrIdx < headerItems[dimension].length; attrIdx += 1) {
                result.headerItems[dimension][attrIdx].push(...headerItems[dimension][attrIdx]);
            }
        }
    };

    // merge data
    const rowOffset = paging.offset[0];
    if (result.data[rowOffset]) { // appending columns to existing rows
        for (let i = 0; i < data.length; i += 1) {
            const columns = data[i] as Execution.DataValue[];
            const resultData = result.data[i + rowOffset] as Execution.DataValue[];
            resultData.push(...columns);
        }
    } else { // appending new rows
        const resultData = result.data as Execution.DataValue[];
        const currentPageData = data as Execution.DataValue[];
        resultData.push(...currentPageData);
    }

    // merge headerItems
    if (paging.offset.length > 1) {
        mergeHeaderItems(0);
        mergeHeaderItems(1);
    }

    // update page count
    if (paging.offset.length === 1) {
        result.paging.count = [result.data.length];
    }
    if (paging.offset.length === 2) {
        result.paging.count = [result.data.length, (result.data[0] as Execution.DataValue[]).length];
    }

    return result;
}
