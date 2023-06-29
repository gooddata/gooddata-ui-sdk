// (C) 2007-2020 GoodData Corporation
import { invariant } from "ts-invariant";
import qs from "qs";
import range from "lodash/range.js";
import { GdcExecution, GdcExecuteAFM } from "@gooddata/api-model-bear";

import { XhrModule, ApiResponseError } from "../xhr.js";
import { convertExecutionToJson } from "./execute-afm.convert.js";
import { stringify } from "../utils/queryString.js";

export const DEFAULT_LIMIT = 1000;

/**
 * This interface represents input for executeVisualization API endpoint.
 *
 * NOTE: all functionality related to executeVisualization is experimental and subject to possible breaking changes
 * in the future; location and shape of this interface WILL change when the functionality is made GA.
 *
 * @internal
 * @internal
 */
export interface IVisualizationExecution {
    visualizationExecution: {
        reference: string;
        resultSpec?: GdcExecuteAFM.IResultSpec;
        filters?: GdcExecuteAFM.CompatibilityFilter[];
    };
}

/**
 * This interface represents error caused during second part of api execution (data fetching)
 * and contains information about first execution part if that part was successful.
 *
 * @internal
 * @internal
 */
export class ApiExecutionResponseError extends ApiResponseError {
    constructor(error: ApiResponseError, public executionResponse: GdcExecution.IExecutionResponse) {
        super(error.message, error.response, error.responseBody);
    }
}

export class ExecuteAfmModule {
    constructor(private xhr: XhrModule) {}

    /**
     * Execute AFM and fetch all data results
     *
     * @param projectId - GD project identifier
     * @param execution - what to execute
     *
     * @returns Structure with `executionResponse` and `executionResult`
     */
    public executeAfm(
        projectId: string,
        execution: GdcExecuteAFM.IExecution,
    ): Promise<GdcExecution.IExecutionResponses> {
        validateNumOfDimensions(execution.execution.resultSpec?.dimensions?.length ?? 0);
        return this.getExecutionResponse(projectId, execution).then(
            (executionResponse: GdcExecution.IExecutionResponse) => {
                return this.getExecutionResult(executionResponse.links.executionResult)
                    .then((executionResult: GdcExecution.IExecutionResult | null) => {
                        return { executionResponse, executionResult };
                    })
                    .catch((error) => {
                        throw new ApiExecutionResponseError(error, executionResponse);
                    });
            },
        );
    }

    /**
     * Execute AFM and return execution's response; the response describes dimensionality of the results and
     * includes link to poll for the results.
     *
     * @param projectId - GD project identifier
     * @param execution - what to get the response for
     *
     * @returns Promise with `executionResponse`
     */
    public getExecutionResponse(
        projectId: string,
        execution: GdcExecuteAFM.IExecution,
    ): Promise<GdcExecution.IExecutionResponse> {
        validateNumOfDimensions(execution.execution.resultSpec?.dimensions?.length ?? 0);
        return this.xhr
            .post(`/gdc/app/projects/${projectId}/executeAfm`, { body: convertExecutionToJson(execution) })
            .then((apiResponse) => apiResponse.getData())
            .then(unwrapExecutionResponse);
    }

    /**
     * Execute saved visualization and get all data.
     *
     * NOTE: all functionality related to executeVisualization is experimental and subject to possible breaking changes
     * in the future; location and shape of this interface WILL change when the functionality is made GA.
     *
     * @param projectId - GD project identifier
     * @param visExecution - execution payload
     *
     * @internal
     * @internal
     */
    public _executeVisualization(
        projectId: string,
        visExecution: IVisualizationExecution,
    ): Promise<GdcExecution.IExecutionResponses> {
        // We have ONE-3961 as followup to take this out of experimental mode

        return this._getVisExecutionResponse(projectId, visExecution).then(
            (executionResponse: GdcExecution.IExecutionResponse) => {
                return this.getExecutionResult(executionResponse.links.executionResult).then(
                    (executionResult: GdcExecution.IExecutionResult | null) => {
                        return { executionResponse, executionResult };
                    },
                );
            },
        );
    }

    /**
     *
     * Execute visualization and return the response; the response describes dimensionality of the results and
     * includes link to poll for the results.
     *
     * NOTE: all functionality related to executeVisualization is experimental and subject to possible breaking changes
     * in the future; location and shape of this interface WILL change when the functionality is made GA.
     *
     * @param projectId - GD project identifier
     * @param visExecution - execution payload
     *
     * @internal
     * @internal
     */
    public _getVisExecutionResponse(
        projectId: string,
        visExecution: IVisualizationExecution,
    ): Promise<GdcExecution.IExecutionResponse> {
        // We have ONE-3961 as followup to take this out of experimental mode

        const body = createExecuteVisualizationBody(visExecution);

        return this.xhr
            .post(`/gdc/app/projects/${projectId}/executeVisualization`, { body })
            .then((apiResponse) => apiResponse.getData())
            .then(unwrapExecutionResponse);
    }

    //
    // working with results
    //

    /**
     * Get one page of Result from Execution (with requested limit and offset)
     *
     * @param executionResultUri - URI of the execution result to work with
     * @param limit - limit for each dimension
     * @param offset - offset for each dimension
     *
     * @returns Promise with `executionResult` or `null` (null means empty response - HTTP 204)
     */
    public getPartialExecutionResult(
        executionResultUri: string,
        limit: number[],
        offset: number[],
    ): Promise<GdcExecution.IExecutionResult | null> {
        const executionResultUriQueryPart = getExecutionResultUriQueryPart(executionResultUri);
        const numOfDimensions = Number(qs.parse(executionResultUriQueryPart).dimensions);
        validateNumOfDimensions(numOfDimensions);

        return this.getPage(executionResultUri, limit, offset);
    }

    /**
     * Get whole ExecutionResult
     *
     * @param executionResultUri - URI of the execution result to work with
     *
     * @returns Promise with `executionResult` or `null` (null means empty response - HTTP 204)
     */
    public getExecutionResult(executionResultUri: string): Promise<GdcExecution.IExecutionResult | null> {
        const executionResultUriQueryPart = getExecutionResultUriQueryPart(executionResultUri);
        const numOfDimensions = Number(qs.parse(executionResultUriQueryPart).dimensions);
        validateNumOfDimensions(numOfDimensions);

        const limit = Array(numOfDimensions).fill(DEFAULT_LIMIT);
        const offset = Array(numOfDimensions).fill(0);

        return this.getAllPages(executionResultUri, limit, offset);
    }

    private getPage(
        executionResultUri: string,
        limit: number[],
        offset: number[],
    ): Promise<GdcExecution.IExecutionResult | null> {
        return this.fetchExecutionResult(executionResultUri, limit, offset).then(
            (executionResultWrapper: GdcExecution.IExecutionResultWrapper | null) => {
                return executionResultWrapper ? unwrapExecutionResult(executionResultWrapper) : null;
            },
        );
    }

    private getAllPages(
        executionResultUri: string,
        limit: number[],
        offset: number[],
        prevExecutionResult?: GdcExecution.IExecutionResult,
    ): Promise<GdcExecution.IExecutionResult | null> {
        return this.fetchExecutionResult(executionResultUri, limit, offset).then(
            (executionResultWrapper: GdcExecution.IExecutionResultWrapper | null) => {
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
            },
        );
    }

    private fetchExecutionResult(
        executionResultUri: string,
        limit: number[],
        offset: number[],
    ): Promise<GdcExecution.IExecutionResultWrapper | null> {
        const uri = replaceLimitAndOffsetInUri(executionResultUri, limit, offset);

        return this.xhr
            .get(uri)
            .then((apiResponse) => (apiResponse.response.status === 204 ? null : apiResponse.getData()));
    }
}

function getExecutionResultUriQueryPart(executionResultUri: string): string {
    return executionResultUri.split(/\?(.+)/)[1];
}

function unwrapExecutionResponse(
    executionResponseWrapper: GdcExecution.IExecutionResponseWrapper,
): GdcExecution.IExecutionResponse {
    return executionResponseWrapper.executionResponse;
}

function unwrapExecutionResult(
    executionResultWrapper: GdcExecution.IExecutionResultWrapper,
): GdcExecution.IExecutionResult {
    return executionResultWrapper.executionResult;
}

function validateNumOfDimensions(numOfDimensions: number): void {
    invariant(
        numOfDimensions === 1 || numOfDimensions === 2,
        `${numOfDimensions} dimensions are not allowed. Only 1 or 2 dimensions are supported.`,
    );
}

function createExecuteVisualizationBody(visExecution: IVisualizationExecution): string {
    const { reference, resultSpec, filters } = visExecution.visualizationExecution;
    const resultSpecProp = resultSpec ? { resultSpec } : undefined;
    const filtersProp = filters ? { filters } : undefined;

    return JSON.stringify({
        visualizationExecution: {
            reference,
            ...resultSpecProp,
            ...filtersProp,
        },
    });
}

export function replaceLimitAndOffsetInUri(oldUri: string, limit: number[], offset: number[]): string {
    const [uriPart, queryPart] = oldUri.split(/\?(.+)/);
    const query = {
        ...qs.parse(queryPart),
        limit: limit.join(","),
        offset: offset.join(","),
    };

    return uriPart + stringify(query, { addQueryPrefix: true });
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

    const getSingleNextLimit = (limit: number, nextOffset: number, total: number): number =>
        nextOffset + limit > total ? total - nextOffset : limit;

    // prevent set up lower limit than possible for 2nd dimension in the beginning of the next rows
    if (
        numOfDimensions === 2 &&
        nextOffset[1] === 0 && // beginning of the next rows
        limit[0] < total[1] // limit from 1st dimension should be used in 2nd dimension
    ) {
        return [getSingleNextLimit(limit[0], nextOffset[0], total[0]), limit[0]];
    }

    return range(numOfDimensions).map((i: number) => getSingleNextLimit(limit[i], nextOffset[i], total[i]));
}

export function nextPageExists(nextOffset: number[], total: number[]): boolean {
    // expression "return nextLimit[0] > 0" also returns correct result
    return nextOffset[0] < total[0];
}

function mergeHeaderItemsForEachAttribute(
    dimension: number,
    headerItems: GdcExecution.IResultHeaderItem[][][] | undefined,
    result: GdcExecution.IExecutionResult,
) {
    if (headerItems && result.headerItems) {
        for (let attrIdx = 0; attrIdx < headerItems[dimension].length; attrIdx += 1) {
            result.headerItems[dimension][attrIdx].push(...headerItems[dimension][attrIdx]);
        }
    }
}

// works only for one or two dimensions
export function mergePage(
    prevExecutionResult: GdcExecution.IExecutionResult,
    executionResult: GdcExecution.IExecutionResult,
): GdcExecution.IExecutionResult {
    const result = prevExecutionResult;
    const { headerItems, data, paging } = executionResult;

    const mergeHeaderItems = (dimension: number) => {
        // for 1 dimension we already have the headers from first page
        const otherDimension = dimension === 0 ? 1 : 0;
        const isEdge = paging.offset[otherDimension] === 0;
        if (isEdge) {
            mergeHeaderItemsForEachAttribute(dimension, headerItems, result);
        }
    };

    // merge data
    const rowOffset = paging.offset[0];
    if (result.data[rowOffset]) {
        // appending columns to existing rows
        for (let i = 0; i < data.length; i += 1) {
            const columns = data[i] as GdcExecution.DataValue[];
            const resultData = result.data[i + rowOffset] as GdcExecution.DataValue[];
            resultData.push(...columns);
        }
    } else {
        // appending new rows
        const resultData = result.data as GdcExecution.DataValue[];
        const currentPageData = data as GdcExecution.DataValue[];
        resultData.push(...currentPageData);
    }

    // merge headerItems
    if (paging.offset.length > 1) {
        mergeHeaderItems(0);
        mergeHeaderItems(1);
    } else {
        mergeHeaderItemsForEachAttribute(0, headerItems, result);
    }

    // update page count
    if (paging.offset.length === 1) {
        result.paging.count = [result?.headerItems?.[0]?.[0]?.length ?? 0];
    }
    if (paging.offset.length === 2) {
        result.paging.count = [
            result?.headerItems?.[0]?.[0]?.length ?? 0,
            result?.headerItems?.[1]?.[0]?.length ?? 0,
        ];
    }

    return result;
}
