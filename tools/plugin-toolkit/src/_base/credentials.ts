// (C) 2021-2025 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";

import { promptApiToken } from "./terminal/prompts.js";
import { InputValidationError } from "./types.js";

export type BackendCredentials = {
    /**
     * Value of TIGER_API_TOKEN retrieved from the environment (files or process)
     */
    token: string | undefined;
};

export function createCredentialsFromEnv(env: Record<string, string>): BackendCredentials {
    return {
        token: env.TIGER_API_TOKEN,
    };
}

export async function promptCredentials(): Promise<BackendCredentials> {
    const token = await promptApiToken();
    return {
        token,
    };
}

type CredentialsValidationError = "TOKEN_MISSING";

/**
 * Validate that the gathered credentials provided token must be specified.
 *
 * If any essential prop is missing value - being undefined or empty, an appropriate validation error value is
 * returned. Otherwise, undefined is returned.
 *
 * @param backend - backend being targeted by the CLI
 * @param credentials - gathered credentials
 */
export function validateCredentialsComplete(
    credentials: BackendCredentials,
): CredentialsValidationError | undefined {
    const { token } = credentials;

    if (isEmpty(token)) {
        return "TOKEN_MISSING";
    }

    return undefined;
}

/**
 * Validate token must be specified.
 *
 * If any essential prop is missing value - being undefined or empty, then InputValidationError flies. Otherwise
 * the function just returns.
 *
 * @param credentials - gathered credentials
 */
export function completeCredentialsOrDie(credentials: BackendCredentials): void {
    const validationError = validateCredentialsComplete(credentials);
    if (validationError === "TOKEN_MISSING") {
        throw new InputValidationError(
            "token",
            "",
            "Unable to determine token to use for authentication to GoodData.CN. Please make sure TIGER_API_TOKEN env variable is set in your session or in the .env.secrets file",
        );
    }
}
