// (C) 2007-2018 GoodData Corporation
import { Execution } from '@gooddata/typings';
import { DataLayer, ApiResponseError } from '@gooddata/gooddata-js';
import { ErrorStates, ErrorCodes } from '../constants/errorStates';
import { get, includes } from 'lodash';

function getJSONFromText(data: string): object {
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

export function convertErrors(error: ApiResponseError) {
    const errorCode: number = error.response.status;
    switch (errorCode) {
        case 204:
            throw ErrorStates.NO_DATA;

        case DataLayer.ErrorCodes.HTTP_TOO_LARGE:
            throw ErrorStates.DATA_TOO_LARGE_TO_COMPUTE;

        case DataLayer.ErrorCodes.HTTP_BAD_REQUEST:
            const message = get(getJSONFromText(error.responseBody), 'error.message', '');

            if (includes(message, 'Attempt to execute protected report unsafely')) {
                throw ErrorStates.PROTECTED_REPORT;
            } else {
                throw ErrorStates.BAD_REQUEST;
            }

        case ErrorCodes.EMPTY_AFM:
            throw ErrorStates.EMPTY_AFM;

        case ErrorCodes.INVALID_BUCKETS:
            throw ErrorStates.INVALID_BUCKETS;

        default:
            throw ErrorStates.UNKNOWN_ERROR;
    }
}

/** @deprecated */
function isNullExecutionResult(responses: Execution.IExecutionResponses): boolean {
    return responses.executionResult === null;
}

function hasEmptyData(responses: Execution.IExecutionResponses): boolean {
    return responses.executionResult.executionResult.data.length === 0;
}

function hasMissingHeaderItems(responses: Execution.IExecutionResponses): boolean {
    return !responses.executionResult.executionResult.headerItems;
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
            name: 'EmptyResulError',
            response: {
                status: 204,
                json: () => Promise.resolve(null),
                text: () => Promise.resolve(null)
            }
        };
    }

    return responses;
}
