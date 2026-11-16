// (C) 2026 GoodData Corporation

import { newAxios, setAxiosAuthorizationToken } from "@gooddata/api-client-tiger";
import { ActionsApi_ValidateEmbeddingOrigin } from "@gooddata/api-client-tiger/endpoints/actions";

/**
 * Parameters of {@link validateEmbeddingOriginWithToken}.
 *
 * @internal
 */
export interface IValidateEmbeddingOriginWithTokenParams {
    /**
     * API token or JWT to check. It is sent as a bearer token.
     */
    token: string;
    /**
     * Origin of the parent window that sent the token.
     */
    origin: string;
    /**
     * Backend hostname. When not set, the request goes to the current origin.
     */
    hostname?: string;
}

/**
 * Checks the origin of a parent window against the embedding origins of the organization, with the
 * credentials of the token that the parent sent.
 *
 * @remarks
 * The request goes through a new axios instance and not through the backend, so that:
 * - the check works also when the current token of the backend has expired,
 * - an authentication error does not start the authentication flow of the backend,
 * - the current authentication of the backend does not change.
 *
 * The instance does not send cookies, so only the token decides. The result is not cached.
 *
 * @returns `true` when the backend answers that the origin is valid, `false` when it answers that the
 *  origin is not valid. Rejects on every error, for example an invalid token or a network error.
 *
 * @internal
 */
export async function validateEmbeddingOriginWithToken({
    token,
    origin,
    hostname,
}: IValidateEmbeddingOriginWithTokenParams): Promise<boolean> {
    const axios = newAxios(hostname);
    axios.defaults.withCredentials = false;
    setAxiosAuthorizationToken(axios, token);

    const { data } = await ActionsApi_ValidateEmbeddingOrigin(axios, "", {
        validateEmbeddingOriginRequest: { origin },
    });
    return data.valid === true;
}
