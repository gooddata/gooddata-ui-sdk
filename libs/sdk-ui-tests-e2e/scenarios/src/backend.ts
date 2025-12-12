// (C) 2022-2025 GoodData Corporation

import { RecommendedCachingConfiguration, withCaching } from "@gooddata/sdk-backend-base";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import tigerFactory, { TigerTokenAuthProvider } from "@gooddata/sdk-backend-tiger";

export function createBackend(): IAnalyticalBackend {
    // TIGER_API_TOKEN is defined globally by Vite's define configuration
    // eslint-disable-next-line no-console
    console.log("createBackend", TIGER_API_TOKEN);

    return withCaching(
        tigerFactory().withAuthentication(new TigerTokenAuthProvider(TIGER_API_TOKEN || "")),
        RecommendedCachingConfiguration,
    );
}
