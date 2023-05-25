// (C) 2021 GoodData Corporation

import { TargetBackendType } from "./types.js";
import bearFactory, { FixedLoginAndPasswordAuthProvider } from "@gooddata/sdk-backend-bear";
import tigerFactory, { TigerTokenAuthProvider } from "@gooddata/sdk-backend-tiger";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendCredentials } from "./credentials.js";

export type BackendConfig = {
    backend: TargetBackendType;
    hostname: string;
    credentials: BackendCredentials;
};

/**
 * Creates a new analytical backend according to the provided config.
 *
 * Note: this function assumes & does not check that the necessary props holding credentials/token are
 * set. It is responsibility of the caller to ensure that & properly communicate to the user via CLI
 * messages.
 */
export function createBackend(backendConfig: BackendConfig): IAnalyticalBackend {
    const { backend, hostname, credentials } = backendConfig;

    if (backend === "bear") {
        const { username, password } = credentials;

        return bearFactory({
            hostname,
        }).withAuthentication(new FixedLoginAndPasswordAuthProvider(username!, password!));
    } else {
        const { token } = credentials;

        return tigerFactory({
            hostname,
        }).withAuthentication(new TigerTokenAuthProvider(token!));
    }
}
