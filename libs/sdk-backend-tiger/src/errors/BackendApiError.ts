// (C) 2023 GoodData Corporation
import {
    BackendApiError,
    ErrorResponseData,
} from "@gooddata/sdk-backend-spi";

export class TigerApiError extends BackendApiError {
    private static TRACE_ID_HEADER_KEY = "x-gdc-trace-id";

    protected buildErrorResponseData(): ErrorResponseData {
        const causeError: any = this.cause;
        if (!causeError) {
            return null;
        }

        return {
            traceId: causeError.response?.headers && causeError.response.headers[TigerApiError.TRACE_ID_HEADER_KEY],
            httpStatus: causeError.response?.status,
            rawData: causeError.response?.data ?? {},
        };
    }
}