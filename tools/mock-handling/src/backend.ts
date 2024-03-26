// (C) 2020-2024 GoodData Corporation
import { IAnalyticalBackend, UnexpectedError } from "@gooddata/sdk-backend-spi";
import tigerFactory, { TigerTokenAuthProvider } from "@gooddata/sdk-backend-tiger";

import { BackendType } from "./base/types.js";

let backend: IAnalyticalBackend | null = null;

export const getOrInitBackend = (
    tigerToken: string,
    hostname: string,
    backendType: BackendType,
): IAnalyticalBackend => {
    // return the current backend if we have one
    if (backend) {
        return backend;
    }

    if (!tigerToken) {
        throw new UnexpectedError("Tiger token not provided");
    }

    if (backendType === "tiger") {
        backend = tigerFactory({ hostname }).withAuthentication(new TigerTokenAuthProvider(tigerToken));
    } else {
        throw new UnexpectedError("Unknown backend type");
    }

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
