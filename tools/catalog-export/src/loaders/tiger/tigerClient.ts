// (C) 2007-2021 GoodData Corporation

import { ITigerClient, newAxios, tigerClientFactory } from "@gooddata/api-client-tiger";

/**
 * Creates a new tiger client that will connect to the provided hostname (include schema in the hostname) and
 * will use the provided username and password for basic auth.
 *
 * @param hostname - hostname where tiger runs
 * @param username - username for authentication
 * @param password - password for authentication
 */
export function createTigerClient(hostname: string, username?: string, password?: string): ITigerClient {
    const axios = newAxios(hostname);

    if (username && password) {
        axios.defaults.auth = {
            username,
            password,
        };
    }

    return tigerClientFactory(axios);
}
