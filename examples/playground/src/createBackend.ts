// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { TigerSpecificFunctions } from "@gooddata/sdk-backend-tiger";

let tigerSpecificFunctions: TigerSpecificFunctions | undefined = undefined;

export function createBackend(): {
    backend: IAnalyticalBackend;
    tigerSpecificFunctions: TigerSpecificFunctions | undefined;
} {
    // do not replace ifs with a switch
    // do not use isTigerBackend instead of BACKEND_TYPE === "tiger", etc.
    // do not extract the bodies to functions
    // otherwise you will break the tree shaking and end up with both backend types in the bundle
    if (BACKEND_TYPE === "tiger") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const tiger = require("@gooddata/sdk-backend-tiger");
        const { default: tigerFactory, TigerTokenAuthProvider } = tiger;
        return {
            backend: tigerFactory(undefined, {
                onTigerSpecificFunctionsReady: (functions: TigerSpecificFunctions): void => {
                    tigerSpecificFunctions = functions;
                },
            }).withAuthentication(new TigerTokenAuthProvider(process.env.TIGER_API_TOKEN!)),
            tigerSpecificFunctions,
        };
    } else if (BACKEND_TYPE === "bear") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const bear = require("@gooddata/sdk-backend-bear");
        const { default: bearFactory, AnonymousAuthProvider, FixedLoginAndPasswordAuthProvider } = bear;

        const backend = bearFactory();

        if (BUILD_TYPE === "public") {
            return backend.withAuthentication(new AnonymousAuthProvider());
        }

        return {
            backend: backend.withAuthentication(
                new FixedLoginAndPasswordAuthProvider(process.env.GDC_USERNAME!, process.env.GDC_PASSWORD!),
            ),
            tigerSpecificFunctions: undefined,
        };
    } else {
        const sdkBackend: never = BACKEND_TYPE;
        throw new Error(`unknown SDK backend: ${sdkBackend}`);
    }
}
