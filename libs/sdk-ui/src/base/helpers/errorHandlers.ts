// (C) 2007-2018 GoodData Corporation
import {
    AnalyticalBackendErrorTypes,
    isAnalyticalBackendError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import * as HttpStatusCodes from "http-status-codes";
import { InjectedIntl } from "react-intl";
import { ErrorStates } from "../constants/errorStates";
import { isSdkError, RuntimeError } from "../errors/RuntimeError";

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
export function convertErrors(inError: Error): RuntimeError {
    if (isSdkError(inError)) {
        return inError;
    } else if (isAnalyticalBackendError(inError)) {
        if (isUnexpectedResponseError(inError)) {
            switch (inError.httpStatus) {
                case HttpStatusCodes.NOT_FOUND:
                    return new RuntimeError(ErrorStates.NOT_FOUND, inError);
                case HttpStatusCodes.BAD_REQUEST:
                    return new RuntimeError(ErrorStates.BAD_REQUEST, inError);
                default:
                    return new RuntimeError(ErrorStates.UNKNOWN_ERROR, inError);
            }
        }

        switch (inError.abeType) {
            case AnalyticalBackendErrorTypes.NO_DATA:
                return new RuntimeError(ErrorStates.NO_DATA, inError);
            case AnalyticalBackendErrorTypes.DATA_TOO_LARGE:
                return new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE, inError);
            case AnalyticalBackendErrorTypes.PROTECTED_DATA:
                return new RuntimeError(ErrorStates.PROTECTED_REPORT, inError);
            case AnalyticalBackendErrorTypes.NOT_AUTHENTICATED:
                return new RuntimeError(ErrorStates.UNAUTHORIZED, inError);
            default:
                return new RuntimeError(ErrorStates.UNKNOWN_ERROR, inError);
        }
    }

    return new RuntimeError(ErrorStates.UNKNOWN_ERROR, inError);
}
