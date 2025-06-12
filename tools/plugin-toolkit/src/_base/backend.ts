// (C) 2021-2024 GoodData Corporation

import tigerFactory, { TigerTokenAuthProvider } from "@gooddata/sdk-backend-tiger";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendCredentials } from "./credentials.js";

export type BackendConfig = {
    hostname: string;
    credentials: BackendCredentials;
};

/**
 * Creates a new analytical backend according to the provided config.
 *
 * Note: this function assumes & does not check that the necessary props holding token are
 * set. It is responsibility of the caller to ensure that & properly communicate to the user via CLI
 * messages.
 */
export function createBackend(backendConfig: BackendConfig): IAnalyticalBackend {
    const { hostname, credentials } = backendConfig;

    const { token } = credentials;

    return tigerFactory({
        hostname,
    }).withAuthentication(new TigerTokenAuthProvider(token!));
}
