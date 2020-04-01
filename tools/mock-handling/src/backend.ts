// (C) 2020 GoodData Corporation
import { IAnalyticalBackend, NotSupported, UnexpectedError } from "@gooddata/sdk-backend-spi";
import bearFactory, { FixedLoginAndPasswordAuthProvider } from "@gooddata/sdk-backend-bear";

import { BackendType } from "./base/types";

let backend: IAnalyticalBackend | null = null;

export const initBackend = (
    username: string,
    password: string,
    hostname: string,
    backendType: BackendType,
): void => {
    if (backendType === "tiger") {
        throw new NotSupported("Tiger backend does not support auth yet");
    }

    backend = bearFactory({ hostname }).withAuthentication(
        new FixedLoginAndPasswordAuthProvider(username, password),
    );
};

const getBackend = () => {
    if (!backend) {
        throw new UnexpectedError(
            "Backend not initialized before use. Make sure you have called initBackend.",
        );
    }
    return backend;
};

export default getBackend;
