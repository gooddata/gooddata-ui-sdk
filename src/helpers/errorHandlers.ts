import { Execution } from '@gooddata/typings';
import {
    ErrorCodes as DataErrorCodes
} from '@gooddata/data-layer';
import { ErrorStates, ErrorCodes } from '../constants/errorStates';

export function convertErrors(error: Execution.IError) {
    const errorCode: number = error.response.status;

    switch (errorCode) {
        case 204:
            throw ErrorStates.NO_DATA;

        case DataErrorCodes.HTTP_TOO_LARGE:
            throw ErrorStates.DATA_TOO_LARGE_TO_COMPUTE;

        case DataErrorCodes.HTTP_BAD_REQUEST:
            throw ErrorStates.BAD_REQUEST;

        case ErrorCodes.EMPTY_AFM:
            throw ErrorStates.EMPTY_AFM;

        case ErrorCodes.INVALID_BUCKETS:
            throw ErrorStates.INVALID_BUCKETS;

        default:
            throw ErrorStates.UNKNOWN_ERROR;
    }
}

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

function isEmptyResult(responses: Execution.IExecutionResponses): boolean {
    return isNullExecutionResult(responses) || isEmptyDataResult(responses);
}

export function checkEmptyResult(responses: Execution.IExecutionResponses) {
    if (isEmptyResult(responses)) {
        throw {
            name: 'EmptyResulError',
            response: {
                status: 204
            }
        };
    }

    return responses;
}
