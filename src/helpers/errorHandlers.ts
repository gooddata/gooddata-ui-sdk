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

export function checkEmptyResult(responses: Execution.IExecutionResponses) {
    if (responses.executionResult === null) {
        throw {
            response: {
                status: 204
            }
        };
    }

    return responses;
}
