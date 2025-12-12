// (C) 2007-2025 GoodData Corporation

import {
    type ITigerClient,
    newAxios,
    setAxiosAuthorizationToken,
    tigerClientFactory,
} from "@gooddata/api-client-tiger";

/**
 * Creates a new tiger client that will connect to the provided hostname (include schema in the hostname). The
 * authorization headers will be set as follows:
 *
 * -  If token is provided, its value will be used as Authorization bearer token
 * -  Otherwise if username && password are specified, they will be used for basic-auth.
 *
 * @param hostname - hostname where tiger runs
 * @param token - tiger API token for authentication
 * @param username - username for authentication
 * @param password - password for authentication
 */
export function createTigerClient(
    hostname: string,
    token?: string,
    username?: string,
    password?: string,
): ITigerClient {
    const axios = newAxios(hostname);

    if (token) {
        setAxiosAuthorizationToken(axios, token);
    } else if (username && password) {
        /*
         * Tiger does not support basic auth out of the box; this stays here in case end-user re-configures their
         * gateway for basic auth (may be common in some dev setups).
         */
        axios.defaults.auth = {
            username,
            password,
        };
    }

    return tigerClientFactory(axios);
}
