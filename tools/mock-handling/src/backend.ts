// (C) 2020 GoodData Corporation
import { IAnalyticalBackend, NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import bearFactory, { FixedLoginAndPasswordAuthProvider } from "@gooddata/sdk-backend-bear";

import { BackendType } from "./base/types.js";

let backend: IAnalyticalBackend | null = null;

export const getOrInitBackend = (
    username: string,
    password: string,
    hostname: string,
    backendType: BackendType,
): IAnalyticalBackend => {
    // return the current backend if we have one
    if (backend) {
        return backend;
    }

    if (backendType === "tiger") {
        throw new NotSupported("Tiger backend does not support auth yet");
    }

    backend = bearFactory({ hostname }).withAuthentication(
        new FixedLoginAndPasswordAuthProvider(username, password),
    );

    return backend;
};

const getBackend = (): IAnalyticalBackend => {
    if (!backend) {
        throw new UnexpectedError(
            "Backend not initialized before use. Make sure you have called initBackend.",
        );
    }
    return backend;
};

export default getBackend;
