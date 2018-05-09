// (C) 2007-2018 GoodData Corporation
import { Execution } from '@gooddata/typings';
import { ApiResponseError } from '@gooddata/gooddata-js';
import { ErrorStates, ErrorCodes } from '../constants/errorStates';
import { get, includes } from 'lodash';
import * as HttpStatusCodes from 'http-status-codes';
import { RuntimeError } from '../errors/RuntimeError';

function getJSONFromText(data: string): object {
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

export function convertErrors(error: ApiResponseError): RuntimeError {
    const errorCode: number = error.response.status;
    switch (errorCode) {
        case HttpStatusCodes.NO_CONTENT:
            return new RuntimeError(ErrorStates.NO_DATA, error);

        case HttpStatusCodes.REQUEST_TOO_LONG:
            return new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE, error);

        case HttpStatusCodes.BAD_REQUEST:
            const message = get(getJSONFromText(error.responseBody), 'error.message', '');

            if (includes(message, 'Attempt to execute protected report unsafely')) {
                return new RuntimeError(ErrorStates.PROTECTED_REPORT, error);
            } else {
                return new RuntimeError(ErrorStates.BAD_REQUEST, error);
            }

        case ErrorCodes.EMPTY_AFM:
            return new RuntimeError(ErrorStates.EMPTY_AFM);

        case ErrorCodes.INVALID_BUCKETS:
            return new RuntimeError(ErrorStates.INVALID_BUCKETS);

        default:
            return new RuntimeError(ErrorStates.UNKNOWN_ERROR);
    }
}

/** @deprecated */
function isNullExecutionResult(responses: Execution.IExecutionResponses): boolean {
    return responses.executionResult === null;
}

function hasEmptyData(responses: Execution.IExecutionResponses): boolean {
    return responses.executionResult.data.length === 0;
}

function hasMissingHeaderItems(responses: Execution.IExecutionResponses): boolean {
    return !responses.executionResult.headerItems;
}

function isEmptyDataResult(responses: Execution.IExecutionResponses): boolean {
    return hasEmptyData(responses) && hasMissingHeaderItems(responses);
}

/**
 * isEmptyResult
 * is a function that returns true if the execution result is empty (no data points) and false otherwise.
 * @param responses:Execution.IExecutionResponses - object with execution response and result
 * @return boolean
 * @internal
 */
export function isEmptyResult(responses: Execution.IExecutionResponses): boolean {
    return isNullExecutionResult(responses) || isEmptyDataResult(responses);
}

export function checkEmptyResult(responses: Execution.IExecutionResponses) {
    if (isEmptyResult(responses)) {
        throw {
            name: 'EmptyResultError',
            response: {
                status: HttpStatusCodes.NO_CONTENT,
                json: () => Promise.resolve(null),
                text: () => Promise.resolve(null)
            }
        };
    }

    return responses;
}
