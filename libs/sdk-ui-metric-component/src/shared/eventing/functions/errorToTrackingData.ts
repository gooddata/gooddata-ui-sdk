// (C) 2021-2026 GoodData Corporation

import { type AnalyticalBackendError } from "@gooddata/sdk-backend-spi";

export interface IAxiosError extends Error {
    config: unknown;
    code?: string;
    request?: unknown;
    response?: { status: number };
    isAxiosError: boolean;
}

export function errorToTrackingData(error: AnalyticalBackendError): [string, number?] {
    const cause = error.cause as IAxiosError;

    if (!cause) {
        return [error.message];
    }

    const message = cause.toString();
    const code = cause.isAxiosError ? cause.response?.status : undefined;

    return [message, code];
}
