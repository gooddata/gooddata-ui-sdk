// (C) 2022 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export function createBackend(): IAnalyticalBackend {
    // do not replace ifs with a switch
    // do not use isTigerBackend instead of BACKEND_TYPE === "tiger", etc.
    // do not extract the bodies to functions
    // otherwise you will break the tree shaking and end up with both backend types in the bundle
    if (BACKEND_TYPE === "TIGER") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const tiger = require("@gooddata/sdk-backend-tiger");
        const { default: tigerFactory, TigerTokenAuthProvider } = tiger;
        return tigerFactory().withAuthentication(new TigerTokenAuthProvider(process.env.TIGER_API_TOKEN!));
    } else if (BACKEND_TYPE === "BEAR") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const bear = require("@gooddata/sdk-backend-bear");
        const { default: bearFactory, FixedLoginAndPasswordAuthProvider } = bear;

        const backend = bearFactory();

        return backend.withAuthentication(
            new FixedLoginAndPasswordAuthProvider(process.env.USERNAME!, process.env.PASSWORD!),
        );
    } else {
        const sdkBackend: never = BACKEND_TYPE;
        throw new Error(`unknown SDK backend: ${sdkBackend}`);
    }
}

export const backendWithCredentials = (
    backend: IAnalyticalBackend,
    _username: string,
    _password: string,
): IAnalyticalBackend => {
    return backend;
};
