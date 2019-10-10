// (C) 2019 GoodData Corporation
import { SDK, ApiResponseError } from "@gooddata/gd-bear-client";

export type AsyncCall<T> = (sdk: SDK) => Promise<T>;
export type AuthenticatedCallGuard = <T>(call: AsyncCall<T>) => Promise<T>;

// TODO: move this into bear-client
export function isApiResponseError(error: any): error is ApiResponseError {
    return (error as ApiResponseError).response !== undefined;
}
