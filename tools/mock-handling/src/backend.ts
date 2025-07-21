// (C) 2020-2025 GoodData Corporation
import { IAnalyticalBackend, UnexpectedError } from "@gooddata/sdk-backend-spi";
import tigerFactory, { TigerTokenAuthProvider } from "@gooddata/sdk-backend-tiger";

let backend: IAnalyticalBackend | null = null;

export const getOrInitBackend = (tigerToken: string, hostname: string): IAnalyticalBackend => {
    // return the current backend if we have one
    if (backend) {
        return backend;
    }

    if (!tigerToken) {
        throw new UnexpectedError("Tiger token not provided");
    }

    // assign to global and return
    backend = tigerFactory({ hostname }).withAuthentication(new TigerTokenAuthProvider(tigerToken));
    return backend;
};

export default function getBackend(): IAnalyticalBackend {
    if (!backend) {
        throw new UnexpectedError(
            "Backend not initialized before use. Make sure you have called initBackend.",
        );
    }
    return backend;
}
