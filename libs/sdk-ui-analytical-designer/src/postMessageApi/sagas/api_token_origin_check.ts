// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { validateEmbeddingOriginWithToken } from "@gooddata/sdk-backend-tiger";
import { notifyValidatedCommandOrigin } from "@gooddata/sdk-embedding/internal";

import { isEmbeddingOriginValidationEnabled } from "../../selectors/feature_flag_selector.js";
import { hostVerificationErrored, hostVerificationFailed } from "../actions/command_error_actions.js";

/**
 * Returns a description of a failed check that is safe to log. An axios error keeps the request
 * configuration, with the `Authorization` header that carries the token.
 */
export function describeTokenCheckFailure(error: unknown): string {
    if (typeof error === "object" && error !== null && "isAxiosError" in error && error.isAxiosError) {
        const { response, code } = error as { response?: { status?: number }; code?: string };
        return response?.status === undefined ? (code ?? "network error") : `HTTP ${response.status}`;
    }
    return error instanceof Error ? error.message : String(error);
}

/**
 * Checks the origin of a `setApiToken` command with the token that the command carries, not with the
 * token that the application uses now.
 *
 * @remarks
 * The check goes around the live backend, so it works also when the current token has expired, and
 * an invalid new token does not start the authentication flow. The request goes to the current
 * origin, so a token of another organization fails the check.
 *
 * On a denied origin or a failed check the function writes a warning and posts the same error event
 * as for other commands. The caller must then drop the token and keep the current authentication.
 *
 * @returns `true` when the token can be used: the origin is in the embedding origins, or origin
 *  validation is off.
 */
export function* checkApiTokenOrigin(
    token: string,
    origin: string,
    contextId: string,
): SagaIterator<boolean> {
    const isValidationEnabled: ReturnType<typeof isEmbeddingOriginValidationEnabled> = yield select(
        isEmbeddingOriginValidationEnabled,
    );
    // Without the flag, no backend call: the token is used, as before the validation existed.
    if (!isValidationEnabled) {
        return true;
    }

    let isValid: boolean;
    try {
        isValid = yield call(validateEmbeddingOriginWithToken, { token, origin });
    } catch (e) {
        // oxlint-disable-next-line eslint-js/no-console
        console.warn(
            `Could not check the origin "${origin}" of the new API token (${describeTokenCheckFailure(e)}). The token was not used, the current authentication is kept.`,
        );
        yield put(hostVerificationErrored(contextId));
        return false;
    }
    if (!isValid) {
        // oxlint-disable-next-line eslint-js/no-console
        console.warn(
            `Denied the new API token from the origin "${origin}". The origin is not in the embedding origins of the organization. The current authentication is kept.`,
        );
        yield put(hostVerificationFailed(contextId));
        return false;
    }
    // The outgoing events may wait for the first command with a valid origin.
    yield call(notifyValidatedCommandOrigin, origin);
    return true;
}
