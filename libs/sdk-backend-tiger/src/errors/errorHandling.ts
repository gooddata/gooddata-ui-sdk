// (C) 2019-2020 GoodData Corporation
import { AnalyticalBackendError, UnexpectedError } from "@gooddata/sdk-backend-spi";

export function convertApiError(error: any): AnalyticalBackendError {
    return new UnexpectedError("An unexpected error has occurred", error);
}
