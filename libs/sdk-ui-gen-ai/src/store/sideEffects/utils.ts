// (C) 2024-2026 GoodData Corporation

import {
    type IChatConversationError,
    isChatConversationError,
    isNotAuthenticated,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";

import { type IChatConversationErrorContent, makeErrorContent } from "../../model.js";

export function extractError(e: unknown) {
    if (e instanceof Error) {
        // Prefer error detail from response body over axios's generic message
        const message = extractErrorDetail(e) ?? e.message;
        return `${e.name}: ${message}`;
    }

    return String(e);
}

export function extractErrorContent(e: unknown): IChatConversationErrorContent {
    if (isNotAuthenticated(e)) {
        return makeErrorContent(e.message, 401, undefined, "NOT_AUTHENTICATED");
    }

    if (isChatConversationError(e as IChatConversationError)) {
        const error = e as IChatConversationError;
        return makeErrorContent(
            error.message,
            error.code,
            error.traceId,
            error.code === 401 ? "NOT_AUTHENTICATED" : error.reason,
        );
    }

    if (isUnexpectedResponseError(e)) {
        const body = e.responseBody;
        const detail = extractErrorDetail(e) ?? e.message;
        const reason =
            body && typeof body === "object" && "reason" in body && typeof body.reason === "string"
                ? (body.reason as IChatConversationError["reason"])
                : undefined;
        const traceId =
            e.traceId ??
            (body && typeof body === "object" && "traceId" in body && typeof body.traceId === "string"
                ? body.traceId
                : undefined);

        return makeErrorContent(
            `${e.name}: ${detail}`,
            e.httpStatus,
            traceId,
            e.httpStatus === 401 ? "NOT_AUTHENTICATED" : reason,
        );
    }

    if (e instanceof Error) {
        return makeErrorContent(`${e.name}: ${e.message}`);
    }

    return makeErrorContent(String(e));
}

function extractErrorDetail(e: Error): string | undefined {
    if (!isUnexpectedResponseError(e)) return undefined;
    const body = e.responseBody;
    if (body && typeof body === "object" && "detail" in body && typeof body.detail === "string") {
        return body.detail;
    }
    return undefined;
}
