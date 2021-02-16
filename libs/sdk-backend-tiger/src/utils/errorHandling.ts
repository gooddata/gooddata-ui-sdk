// (C) 2019-2021 GoodData Corporation
import {
    AnalyticalBackendError,
    isAnalyticalBackendError,
    NotAuthenticated,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import { AxiosError } from "axios";

export function convertApiError(error: Error): AnalyticalBackendError {
    if (isAnalyticalBackendError(error)) {
        return error;
    }

    const notAuthenticated = createNotAuthenticatedError(error);

    if (notAuthenticated) {
        throw notAuthenticated;
    }

    return new UnexpectedError("An unexpected error has occurred", error);
}

export function createNotAuthenticatedError(error: Error): NotAuthenticated | undefined {
    const axiosErrorResponse = (error as AxiosError).response;

    if (!axiosErrorResponse || axiosErrorResponse.status !== 401) {
        return;
    }

    const exc = new NotAuthenticated("No session or session expired", error);

    // TODO: both of these params need to come from the backend.
    //  current problems:
    //  - some resources do not send login URL (empty 401), some do
    //  - no resources send returnRedirectParam
    exc.authenticationFlow = {
        loginUrl: "/appLogin",
        returnRedirectParam: "redirectTo",
    };

    return exc;
}
