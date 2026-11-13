// (C) 2026 GoodData Corporation

import { validateEmbeddingOriginWithToken } from "@gooddata/sdk-backend-tiger";
import { type IUserSettings } from "@gooddata/sdk-model";

import { type IInjectedApiToken } from "./waitForInjectedApiToken.js";

/**
 * The host did not accept the token that the parent sent: its origin is not in the embedding
 * origins of the organization, or the check failed.
 */
export class EmbeddingOriginRejectedError extends Error {
    constructor(
        public readonly origin: string,
        cause?: unknown,
    ) {
        super(`The embedding parent origin "${origin}" is not allowed.`, { cause });
        this.name = "EmbeddingOriginRejectedError";
    }
}

/**
 * Returns a description of a failed check that is safe to log. An axios error keeps the request
 * configuration, with the `Authorization` header that carries the token.
 */
function describeCheckFailure(error: unknown): string {
    if (typeof error === "object" && error !== null && "isAxiosError" in error && error.isAxiosError) {
        const { response, code } = error as { response?: { status?: number }; code?: string };
        return response?.status === undefined ? (code ?? "network error") : `HTTP ${response.status}`;
    }
    return error instanceof Error ? error.message : String(error);
}

/**
 * Checks the origin of the first `setApiToken` with the credentials of the token in it.
 *
 * @returns the validated origin, or `undefined` when origin validation is off.
 * @throws EmbeddingOriginRejectedError when the origin is not valid or the check fails. An error is
 *  not an answer, so it does not let the token through.
 */
export async function checkInjectedTokenOrigin(
    injected: IInjectedApiToken,
    userSettings: IUserSettings,
): Promise<string | undefined> {
    if (!userSettings.enableEmbeddingOriginValidation) {
        return undefined;
    }

    let isValid: boolean;
    try {
        isValid = await validateEmbeddingOriginWithToken({
            token: injected.token,
            origin: injected.origin,
        });
    } catch (e) {
        throw new EmbeddingOriginRejectedError(injected.origin, describeCheckFailure(e));
    }
    if (!isValid) {
        throw new EmbeddingOriginRejectedError(injected.origin);
    }
    return injected.origin;
}
