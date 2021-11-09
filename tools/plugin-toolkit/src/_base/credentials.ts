// (C) 2021 GoodData Corporation

import { InputValidationError, TargetBackendType } from "./types";
import isEmpty from "lodash/isEmpty";

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
export function validateCredentialsAreComplete(
    backend: TargetBackendType,
    credentials: BackendCredentials,
): void {
    const { username, password, token } = credentials;

    if (backend === "bear") {
        if (isEmpty(username)) {
            throw new InputValidationError(
                "username",
                "",
                "Unable to determine username to use when logging into GoodData platform. Please make sure GDC_USERNAME env variable is set in your session or in the .env file",
            );
        }
        if (isEmpty(password)) {
            throw new InputValidationError(
                "password",
                "",
                "Unable to determine password to use when logging into GoodData platform. Please make sure GDC_PASSWORD env variable is set in your session or in the .env file",
            );
        }
    } else if (isEmpty(token)) {
        throw new InputValidationError(
            "token",
            "",
            "Unable to determine token to use for authentication to GoodData.CN. Please make sure TIGER_API_TOKEN env variable is set in your session or in the .env file",
        );
    }
}
