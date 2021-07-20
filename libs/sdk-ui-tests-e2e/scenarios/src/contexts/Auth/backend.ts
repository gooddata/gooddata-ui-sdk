// (C) 2021 GoodData Corporation

import bearFactory, {
    FixedLoginAndPasswordAuthProvider,
    ContextDeferredAuthProvider,
} from "@gooddata/sdk-backend-bear";
import { IAnalyticalBackend, IAnalyticalBackendConfig } from "@gooddata/sdk-backend-spi";

import { backend as hostname } from "../../constants";

const backendConfig: IAnalyticalBackendConfig = process.env.REACT_APP_SET_HOSTNAME ? { hostname } : {};

export const createBackend = (): IAnalyticalBackend => {
    return bearFactory(backendConfig).withAuthentication(new ContextDeferredAuthProvider());
};

export const backendWithCredentials = (
    backend: IAnalyticalBackend,
    username: string,
    password: string,
): IAnalyticalBackend => {
    return backend.withAuthentication(new FixedLoginAndPasswordAuthProvider(username, password));
};
