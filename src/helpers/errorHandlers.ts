// (C) 2007-2018 GoodData Corporation
import { Execution, VisualizationObject } from "@gooddata/typings";
import { ApiResponseError } from "@gooddata/gooddata-js";
import { InjectedIntl } from "react-intl";
import { ErrorStates, ErrorCodes } from "../constants/errorStates";
import get = require("lodash/get");
import includes = require("lodash/includes");
import * as HttpStatusCodes from "http-status-codes";
import { RuntimeError } from "../errors/RuntimeError";
import { unwrap } from "./utils";

function getJSONFromText(data: string): object {
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

function isApiResponseError(error: TypeError | ApiResponseError): error is ApiResponseError {
    return (error as ApiResponseError).response !== undefined;
}

export interface IErrorMap {
    [key: string]: {
        icon?: string;
        message: string;
        description: string;
    };
}

export function generateErrorMap(intl: InjectedIntl): IErrorMap {
    const errorMap = {
        [ErrorStates.DATA_TOO_LARGE_TO_DISPLAY]: {
            icon: "icon-cloud-rain",
            message: intl.formatMessage({ id: "visualization.ErrorMessageDataTooLarge" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionDataTooLarge" }),
        },
        [ErrorStates.NOT_FOUND]: {
            message: intl.formatMessage({ id: "visualization.ErrorMessageNotFound" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionNotFound" }),
        },
        [ErrorStates.UNAUTHORIZED]: {
            message: intl.formatMessage({ id: "visualization.ErrorMessageUnauthorized" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionUnauthorized" }),
        },
        [ErrorStates.NO_DATA]: {
            icon: "icon-filter",
            message: intl.formatMessage({ id: "visualization.ErrorMessageNoData" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionNoData" }),
        },
        [ErrorStates.UNKNOWN_ERROR]: {
            message: intl.formatMessage({ id: "visualization.ErrorMessageGeneric" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionGeneric" }),
        },
    };
    return errorMap;
}

// CAREFUL: error can also be of different type than listed
export function convertErrors(error: ApiResponseError | TypeError): RuntimeError {
    if (!isApiResponseError(error)) {
        return new RuntimeError(error.message, error);
    }

    const errorCode: number = error.response.status;
    switch (errorCode) {
        case HttpStatusCodes.NO_CONTENT:
            return new RuntimeError(ErrorStates.NO_DATA, error);

        case HttpStatusCodes.REQUEST_TOO_LONG:
            return new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE, error);

        case HttpStatusCodes.BAD_REQUEST:
            const message = get(getJSONFromText(error.responseBody), "error.message", "");

            if (includes(message, "Attempt to execute protected report unsafely")) {
                return new RuntimeError(ErrorStates.PROTECTED_REPORT, error);
            } else {
                return new RuntimeError(ErrorStates.BAD_REQUEST, error);
            }

        case HttpStatusCodes.NOT_FOUND:
            return new RuntimeError(ErrorStates.NOT_FOUND, error);

        case HttpStatusCodes.UNAUTHORIZED:
            return new RuntimeError(ErrorStates.UNAUTHORIZED, error);

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
            name: "EmptyResultError",
            response: {
                status: HttpStatusCodes.NO_CONTENT,
                json: () => Promise.resolve(null),
                text: () => Promise.resolve(null),
            },
        };
    }

    return responses;
}

export const hasDuplicateIdentifiers = (buckets: VisualizationObject.IBucket[]) => {
    const buffer: string[] = [];
    const duplicates: string[] = [];
    buckets.forEach(({ items }) => {
        items.forEach((bucketItem: VisualizationObject.BucketItem) => {
            const localIdentifier: string = unwrap(bucketItem).localIdentifier;
            const isDuplicate = buffer.includes(localIdentifier);
            buffer.push(localIdentifier);
            if (isDuplicate && !duplicates.includes(localIdentifier)) {
                duplicates.push(localIdentifier);
            }
        });
    });
    if (duplicates.length > 0) {
        // tslint:disable-next-line:no-console max-line-length
        console.warn(
            `Duplicate identifier${duplicates.length > 1 ? "s" : ""} '${duplicates.join(
                ", ",
            )}' detected in PivotTable. Please make sure all localIdentifiers are unique.`,
        );
    }
    return duplicates.length > 0;
};
