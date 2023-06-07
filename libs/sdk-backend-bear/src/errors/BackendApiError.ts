// (C) 2023 GoodData Corporation

import {
    BackendApiError,
    ErrorResponseData,
} from "@gooddata/sdk-backend-spi";

export class BearApiError extends BackendApiError {
    private static REQUEST_ID_HEADER_KEY = "x-gdc-request";

    protected buildErrorResponseData(): ErrorResponseData {
        const cause: any = this.cause;
        if (!cause) {
            return null;
        }

        return {
            traceId: cause.response?.headers?.get && cause.response.headers.get(BearApiError.REQUEST_ID_HEADER_KEY),
            httpStatus: cause.response?.status,
            rawData: cause.responseBody ? JSON.parse(cause.responseBody) : {},
        }
    }
}