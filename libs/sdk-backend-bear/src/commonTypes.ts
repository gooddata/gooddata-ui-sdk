// (C) 2019 GoodData Corporation
import { SDK } from "@gooddata/gd-bear-client";
import { AnalyticalBackendError } from "@gooddata/sdk-backend-spi";

export type AsyncCall<T> = (sdk: SDK) => Promise<T>;
export type ErrorConverter = (e: any) => AnalyticalBackendError;
export type AuthenticatedCallGuard = <T>(call: AsyncCall<T>, errorConverter?: ErrorConverter) => Promise<T>;
