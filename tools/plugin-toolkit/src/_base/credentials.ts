// (C) 2021-2022 GoodData Corporation

import { InputValidationError, TargetBackendType } from "./types.js";
import isEmpty from "lodash/isEmpty.js";
import { promptApiToken, promptPassword, promptUsername } from "./terminal/prompts.js";

export type BackendCredentials = {
    /**
     * Value of GDC_USERNAME retrieved from the environment (files or process)
     */
    username: string | undefined;

    /**
     * Value of GDC_PASSWORD retrieved from the environment (files or process)
     */
    password: string | undefined;

    /**
     * Value of TIGER_API_TOKEN retrieved from the environment (files or process)
     */
    token: string | undefined;
};

export function createCredentialsFromEnv(env: Record<string, string>): BackendCredentials {
    return {
        username: env.GDC_USERNAME,
        password: env.GDC_PASSWORD,
        token: env.TIGER_API_TOKEN,
    };
}

export async function promptCredentials(backend: TargetBackendType): Promise<BackendCredentials> {
    if (backend === "bear") {
        const username = await promptUsername();
        const password = await promptPassword();
        return {
            username,
            password,
            token: undefined,
        };
    } else {
        const token = await promptApiToken();
        return {
            token,
            username: undefined,
            password: undefined,
        };
    }
}

type CredentialsValidationError = "USERNAME_MISSING" | "PASSWORD_MISSING" | "TOKEN_MISSING";

/**
 * Validate that the gathered credentials provided on the input are complete in the context of the
 * specified backend type. For 'bear' both username & password must be specified. For 'tiger' only
 * token must be specified.
 *
 * If any essential prop is missing value - being undefined or empty, an appropriate validation error value is
 * returned. Otherwise, undefined is returned.
 *
 * @param backend - backend being targeted by the CLI
 * @param credentials - gathered credentials
 */
export function validateCredentialsComplete(
    backend: TargetBackendType,
    credentials: BackendCredentials,
): CredentialsValidationError | undefined {
    const { username, password, token } = credentials;

    if (backend === "bear") {
        if (isEmpty(username)) {
            return "USERNAME_MISSING";
        }
        if (isEmpty(password)) {
            return "PASSWORD_MISSING";
        }
    } else if (isEmpty(token)) {
        return "TOKEN_MISSING";
    }
}

/**
 * Validate that the gathered credentials provided on the input are complete in the context of the
 * specified backend type. For 'bear' both username & password must be specified. For 'tiger' only
 * token must be specified.
 *
 * If any essential prop is missing value - being undefined or empty, then InputValidationError flies. Otherwise
 * the function just returns.
 *
 * @param backend - backend being targeted by the CLI
 * @param credentials - gathered credentials
 */
export function completeCredentialsOrDie(backend: TargetBackendType, credentials: BackendCredentials): void {
    const validationError = validateCredentialsComplete(backend, credentials);
    switch (validationError) {
        case "USERNAME_MISSING":
            throw new InputValidationError(
                "username",
                "",
                "Unable to determine username to use when logging into GoodData platform. Please make sure GDC_USERNAME env variable is set in your session or in the .env.secrets file",
            );
        case "PASSWORD_MISSING":
            throw new InputValidationError(
                "password",
                "",
                "Unable to determine password to use when logging into GoodData platform. Please make sure GDC_PASSWORD env variable is set in your session or in the .env.secrets file",
            );
        case "TOKEN_MISSING":
            throw new InputValidationError(
                "token",
                "",
                "Unable to determine token to use for authentication to GoodData.CN. Please make sure TIGER_API_TOKEN env variable is set in your session or in the .env.secrets file",
            );
    }
}
