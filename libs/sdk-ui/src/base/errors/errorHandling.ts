// (C) 2007-2020 GoodData Corporation
import {
    AnalyticalBackendErrorTypes,
    isAnalyticalBackendError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import HttpStatusCodes from "http-status-codes";
import { IntlShape } from "react-intl";
import { ErrorCodes, GoodDataSdkError, isGoodDataSdkError } from "./GoodDataSdkError";
import { isCancelError } from "../react/CancelablePromise";

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
        icon: "icon-cloud-rain",
        message: intl.formatMessage({ id: "visualization.ErrorMessageDataTooLarge" }),
        description: intl.formatMessage({ id: "visualization.ErrorDescriptionDataTooLarge" }),
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
            icon: "icon-filter",
            message: intl.formatMessage({ id: "visualization.ErrorMessageNoData" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionNoData" }),
        },
        [ErrorCodes.GEO_MAPBOX_TOKEN_MISSING]: {
            message: intl.formatMessage({ id: "visualization.ErrorDescriptionMissingMapboxToken" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionMissingMapboxToken" }),
        },
        [ErrorCodes.UNKNOWN_ERROR]: {
            message: intl.formatMessage({ id: "visualization.ErrorMessageGeneric" }),
            description: intl.formatMessage({ id: "visualization.ErrorDescriptionGeneric" }),
        },
    };
}

/**
 * Converts any error into an instance of {@link GoodDataSdkError}. The conversion logic right now
 * focuses mostly on errors that are contractually specified in Analytical Backend SPI. All other unexpected
 * errors are wrapped into an exception with the generic 'UNKNOWN_ERROR' code.
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
                case HttpStatusCodes.NOT_FOUND:
                    return new GoodDataSdkError(ErrorCodes.NOT_FOUND, error);
                case HttpStatusCodes.BAD_REQUEST:
                    return new GoodDataSdkError(ErrorCodes.BAD_REQUEST, error);
                default:
                    return new GoodDataSdkError(ErrorCodes.UNKNOWN_ERROR, error);
            }
        }

        switch (error.abeType) {
            case AnalyticalBackendErrorTypes.NO_DATA:
                return new GoodDataSdkError(ErrorCodes.NO_DATA, error);
            case AnalyticalBackendErrorTypes.DATA_TOO_LARGE:
                return new GoodDataSdkError(ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE, error);
            case AnalyticalBackendErrorTypes.PROTECTED_DATA:
                return new GoodDataSdkError(ErrorCodes.PROTECTED_REPORT, error);
            case AnalyticalBackendErrorTypes.NOT_AUTHENTICATED:
                return new GoodDataSdkError(ErrorCodes.UNAUTHORIZED, error);
            default:
                return new GoodDataSdkError(ErrorCodes.UNKNOWN_ERROR, error);
        }
    } else if (isCancelError(error)) {
        return new GoodDataSdkError(ErrorCodes.CANCELLED, error);
    }

    return new GoodDataSdkError(ErrorCodes.UNKNOWN_ERROR, error);
}

/**
 * Default error handler - logs error to console as error.
 *
 * @param error - error to log
 */
export function defaultErrorHandler(error: unknown): void {
    console.error(error); // eslint-disable-line no-console
}
