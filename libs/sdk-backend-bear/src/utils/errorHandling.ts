// (C) 2019-2021 GoodData Corporation
import { ApiResponseError } from "@gooddata/api-client-bear";
import {
    AnalyticalBackendError,
    DataTooLargeError,
    NoDataError,
    NotAuthenticated,
    ProtectedDataError,
    UnexpectedError,
    UnexpectedResponseError,
    isAnalyticalBackendError,
} from "@gooddata/sdk-backend-spi";
import includes from "lodash/includes";
import * as HttpStatusCodes from "http-status-codes";

export function isApiResponseError(error: unknown): error is ApiResponseError {
    return (error as ApiResponseError).response !== undefined;
}

function getJSONFromText(data: string): any | null {
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

function isComplainingAboutAuthorization(error: ApiResponseError): boolean {
    // execution on protected data will actually return with 400 + with error messaging talking about this

    if (error.response.status !== HttpStatusCodes.BAD_REQUEST) {
        return false;
    }

    const message = getJSONFromText(error.responseBody)?.error?.message ?? "";

    return (
        includes(message, "Attempt to execute protected report unsafely") ||
        includes(message, "Export to required format is not allowed for data flagged as restricted")
    );
}

export function convertExecutionApiError(error: Error): AnalyticalBackendError {
    if (isApiResponseError(error)) {
        if (error.response.status === HttpStatusCodes.NO_CONTENT) {
            return new NoDataError("Server returned no data");
        } else if (error.response.status === HttpStatusCodes.REQUEST_TOO_LONG) {
            return new DataTooLargeError(
                "Server has reached data size limits when processing this request",
                error,
            );
        } else if (isComplainingAboutAuthorization(error)) {
            return new ProtectedDataError("Request not authorized", error);
        }
    }

    return convertApiError(error);
}

export function convertApiError(error: Error): AnalyticalBackendError {
    if (isAnalyticalBackendError(error)) {
        return error;
    }

    if (isApiResponseError(error)) {
        if (error.response.status === HttpStatusCodes.UNAUTHORIZED) {
            return new NotAuthenticated("Not authenticated against backend");
        } else if (isComplainingAboutAuthorization(error)) {
            return new ProtectedDataError("Request not authorized", error);
        }

        return new UnexpectedResponseError(error.message, error.response.status, error.responseBody, error);
    }

    return new UnexpectedError("An unexpected error has occurred", error);
}
