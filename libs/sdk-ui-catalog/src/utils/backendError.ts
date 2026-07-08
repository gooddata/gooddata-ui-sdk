// (C) 2026 GoodData Corporation

import { isAnalyticalBackendError, isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";

/**
 * Extracts the human-readable reason from a backend error, if present.
 *
 * For a generic `UnexpectedResponseError` the meaningful reason lives in Tiger's RFC 7807
 * `responseBody.detail`, while `error.message` carries only the transport-level "Request failed
 * with status code NNN" — so that message is intentionally ignored. Other typed backend errors
 * (e.g. `LimitReached` → "Upgrade your plan to create more objects.") carry a curated, user-facing
 * message, which is preserved. Callers fall back to a localized generic message otherwise.
 */
export function extractBackendErrorDetail(error: unknown): string | undefined {
    if (isUnexpectedResponseError(error)) {
        const detail = (error.responseBody as { detail?: unknown } | undefined)?.detail;
        return typeof detail === "string" && detail.trim() !== "" ? detail : undefined;
    }
    if (isAnalyticalBackendError(error) && error.message.trim() !== "") {
        return error.message;
    }
    return undefined;
}
