// (C) 2007-2026 GoodData Corporation

import { StatusCodes as HttpStatusCodes } from "http-status-codes";
import { type IntlShape } from "react-intl";

import {
    AnalyticalBackendErrorTypes,
    type NotAuthenticated,
    isAnalyticalBackendError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";

import {
    BadRequestSdkError,
    CancelledSdkError,
    DataTooLargeToComputeSdkError,
    ErrorCodes,
    type GoodDataSdkError,
    NoDataSdkError,
    NotFoundSdkError,
    ProtectedReportSdkError,
    ResultCacheMissingSdkError,
    UnauthorizedSdkError,
    UnexpectedSdkError,
    isGoodDataSdkError,
} from "./GoodDataSdkError.js";
import { isCancelError } from "../react/CancelablePromise.js";

/**
 * Mapping between error code and human readable description of the error.
 *
 * Key is error code as defined in {@link ErrorCodes}.
 *
 * @public
 */
export interface IErrorDescriptors {
    [key: string]: {
        icon?: string;
        message: string;
        description: string;
    };
}

/**
 * Returns a new, localized error code descriptors.
 *
 * @param intl - localizations
 * @returns always new instance
 * @public
 */
export function newErrorMapping(intl: IntlShape): IErrorDescriptors {
    const tooLargeDescriptor: IErrorDescriptors["any"] = {
        icon: "gd-icon-cloud-rain",
        message: intl.formatMessage({ id: "visualization.ErrorMessageDataTooLarge" }),
        description: intl.formatMessage({ id: "visualization.ErrorDescriptionDataTooLarge" }),
    };

    const genericDescriptor: IErrorDescriptors["any"] = {
        message: intl.formatMessage({ id: "visualization.ErrorMessageGeneric" }),
        description: intl.formatMessage({ id: "visualization.ErrorDescriptionGeneric" }),
    };

    return {
        [ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY]: tooLargeDescriptor,
        [ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE]: tooLargeDescriptor,
        [ErrorCodes.NOT_FOUND]: {
            message: intl.formatMessage({ id: "visualization.ErrorMessageNotFound" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionNotFound" }),
        },
        [ErrorCodes.UNAUTHORIZED]: {
            message: intl.formatMessage({ id: "visualization.ErrorMessageUnauthorized" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionUnauthorized" }),
        },
        [ErrorCodes.NO_DATA]: {
            icon: "gd-icon-filter",
            message: intl.formatMessage({ id: "visualization.ErrorMessageNoData" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionNoData" }),
        },
        [ErrorCodes.GEO_MAPBOX_TOKEN_MISSING]: {
            message: intl.formatMessage({ id: "visualization.ErrorDescriptionMissingMapboxToken" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionMissingMapboxToken" }),
        },
        [ErrorCodes.RESULT_CACHE_MISSING]: {
            icon: "gd-icon-sync",
            message: intl.formatMessage({ id: "visualization.ErrorMessageResultCacheMissing" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionResultCacheMissing" }),
        },
        [ErrorCodes.BAD_REQUEST]: genericDescriptor,
        [ErrorCodes.UNKNOWN_ERROR]: genericDescriptor,
        [ErrorCodes.VISUALIZATION_CLASS_UNKNOWN]: {
            message: intl.formatMessage({ id: "visualization.ErrorMessageGeneric" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionGeneric" }),
        },
    };
}

/**
 * Converts any error into an instance of {@link GoodDataSdkError}.
 *
 * @remarks
 * The conversion logic right now focuses mostly on errors that are contractually specified in Analytical Backend SPI.
 * All other unexpected errors are wrapped into an exception with the generic 'UNKNOWN_ERROR' code.
 *
 * Instances of GoodDataSdkError are returned as-is and are not subject to any processing.
 *
 * @param error - error to convert
 * @returns new instance of GoodDataSdkError
 * @public
 */
export function convertError(error: unknown): GoodDataSdkError {
    if (isGoodDataSdkError(error)) {
        return error;
    } else if (isAnalyticalBackendError(error)) {
        if (isUnexpectedResponseError(error)) {
            switch (error.httpStatus) {
                case HttpStatusCodes.NOT_FOUND as number:
                    return new NotFoundSdkError(ErrorCodes.NOT_FOUND, error);
                case HttpStatusCodes.BAD_REQUEST as number:
                    return new BadRequestSdkError(ErrorCodes.BAD_REQUEST, error);
                case HttpStatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE as number:
                    return new BadRequestSdkError(ErrorCodes.HEADERS_TOO_LARGE, error);
                default:
                    return new UnexpectedSdkError(ErrorCodes.UNKNOWN_ERROR, error);
            }
        }

        switch (error.abeType) {
            case AnalyticalBackendErrorTypes.NO_DATA:
                return new NoDataSdkError(ErrorCodes.NO_DATA, error);
            case AnalyticalBackendErrorTypes.DATA_TOO_LARGE:
                return new DataTooLargeToComputeSdkError(ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE, error);
            case AnalyticalBackendErrorTypes.PROTECTED_DATA:
                return new ProtectedReportSdkError(ErrorCodes.PROTECTED_REPORT, error);
            case AnalyticalBackendErrorTypes.NOT_AUTHENTICATED: {
                const sdkError = new UnauthorizedSdkError(ErrorCodes.UNAUTHORIZED, error);
                sdkError.authenticationFlow = (error as NotAuthenticated).authenticationFlow;
                return sdkError;
            }
            default:
                return new UnexpectedSdkError(ErrorCodes.UNKNOWN_ERROR, error);
        }
    } else if (isCancelError(error)) {
        return new CancelledSdkError(ErrorCodes.CANCELLED, error);
    }

    return new UnexpectedSdkError(ErrorCodes.UNKNOWN_ERROR, error as Error);
}

/**
 * Converts errors from data window requests (e.g., readWindow calls during pagination).
 *
 * Only use in specific `/result` endpoints with paging. Currently `/result` returns 404 only
 * in this specific result cache expired scenario, so we can safely convert it to
 * {@link ResultCacheMissingSdkError}.
 *
 * @remarks
 * This function is a temporary workaround/bypass for a backend limitation. When the execution result
 * cache expires on the backend (usually due to manual cache clearing), subsequent `readWindow`
 * result calls return a generic 404 NOT_FOUND error from existing execution created in the app.
 * It intercepts NOT_FOUND errors and converts them to {@link ResultCacheMissingSdkError},
 * which provides more accurate messaging to the user (e.g., "Visualization needs refresh").
 *
 * This workaround will be merged into the standard {@link convertError} function once the backend
 * properly identifies cache-miss 404s in `/result` with a specific `abeType` or `structuredDetail`,
 * allowing us to distinguish between "not found" and "cache expired" scenarios.
 *
 * @param error - error from a data window request (e.g., from readWindow)
 * @returns new instance of GoodDataSdkError with appropriate error code
 * @internal
 */
export function convertDataWindowError(error: unknown): GoodDataSdkError {
    const convertedError = convertError(error);

    if (convertedError.getErrorCode() === ErrorCodes.NOT_FOUND) {
        return new ResultCacheMissingSdkError(convertedError.getMessage(), convertedError);
    }

    return convertedError;
}

/**
 * Default error handler - logs error to console as error.
 *
 * @param error - error to log
 * @public
 */
export function defaultErrorHandler(error: unknown): void {
    console.error(error);
}
