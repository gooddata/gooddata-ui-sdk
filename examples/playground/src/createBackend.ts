// (C) 2022-2026 GoodData Corporation

import { RecommendedCachingConfiguration, withCaching } from "@gooddata/sdk-backend-base";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { TigerTokenAuthProvider, tigerFactory } from "@gooddata/sdk-backend-tiger";

export function createBackend(): IAnalyticalBackend {
    return withCaching(
        tigerFactory().withAuthentication(
            new TigerTokenAuthProvider(import.meta.env["VITE_TIGER_API_TOKEN"] as string),
        ),
        RecommendedCachingConfiguration,
    );
}
