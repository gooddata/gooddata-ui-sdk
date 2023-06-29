// (C) 2019-2022 GoodData Corporation
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
    NotAuthenticatedReason,
} from "@gooddata/sdk-backend-spi";
import includes from "lodash/includes.js";
import isString from "lodash/isString.js";
import { StatusCodes as HttpStatusCodes } from "http-status-codes";

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

function getTraceId(error: ApiResponseError) {
    return error.response?.headers?.get ? error.response?.headers?.get("x-gdc-request") : null;
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
            // detect expired passwords using the specific exception code from the backend
            // use responseBody directly (instead of response.json) in case the stream has already been used
            // at this point (which would bomb)
            const reason: NotAuthenticatedReason =
                isString(error.responseBody) && includes(error.responseBody, "gdc.login.password.expired")
                    ? "credentials_expired"
                    : "invalid_credentials";

            return new NotAuthenticated("Not authenticated against backend", error, reason);
        } else if (isComplainingAboutAuthorization(error)) {
            return new ProtectedDataError("Request not authorized", error);
        }

        return new UnexpectedResponseError(
            error.message,
            error.response.status,
            error.responseBody,
            getTraceId(error),
            error,
        );
    }

    return new UnexpectedError("An unexpected error has occurred", error);
}
