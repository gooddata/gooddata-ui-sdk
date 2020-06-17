// (C) 2019-2020 GoodData Corporation
import { AnalyticalBackendError, isAnalyticalBackendError, UnexpectedError } from "@gooddata/sdk-backend-spi";

export function convertApiError(error: any): AnalyticalBackendError {
    if (isAnalyticalBackendError(error)) {
        return error;
    }

    return new UnexpectedError("An unexpected error has occurred", error);
}
