// (C) 2024-2026 GoodData Corporation

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";

export function extractError(e: unknown) {
    if (e instanceof Error) {
        // Prefer error detail from response body over axios's generic message
        const message = extractErrorDetail(e) ?? e.message;
        return `${e.name}: ${message}`;
    }

    return String(e);
}

function extractErrorDetail(e: Error): string | undefined {
    if (!isUnexpectedResponseError(e)) return undefined;
    const body = e.responseBody;
    if (body && typeof body === "object" && "detail" in body && typeof body.detail === "string") {
        return body.detail;
    }
    return undefined;
}
