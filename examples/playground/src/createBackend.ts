// (C) 2022-2025 GoodData Corporation
import { RecommendedCachingConfiguration, withCaching } from "@gooddata/sdk-backend-base";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { TigerTokenAuthProvider, tigerFactory } from "@gooddata/sdk-backend-tiger";

export function createBackend(): IAnalyticalBackend {
    return withCaching(
        tigerFactory().withAuthentication(new TigerTokenAuthProvider(import.meta.env.VITE_TIGER_API_TOKEN)),
        RecommendedCachingConfiguration,
    );
}
