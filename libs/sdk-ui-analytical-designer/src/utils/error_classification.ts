// (C) 2026 GoodData Corporation

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { isGoodDataSdkError } from "@gooddata/sdk-ui";

export function isSemanticBackendError(error: unknown): boolean {
    const status = getHttpStatus(error);
    return status !== undefined && status >= 400 && status < 500;
}

function getHttpStatus(error: unknown): number | undefined {
    if (isUnexpectedResponseError(error)) {
        return error.httpStatus;
    }
    const cause = unwrapCause(error);
    if (isUnexpectedResponseError(cause)) {
        return cause.httpStatus;
    }
    return undefined;
}

function unwrapCause(error: unknown): unknown {
    if (isGoodDataSdkError(error)) {
        return error.getCause();
    }
    if (error instanceof Error) {
        return error.cause;
    }
    return undefined;
}
