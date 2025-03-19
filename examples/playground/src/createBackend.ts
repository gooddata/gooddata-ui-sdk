// (C) 2022-2024 GoodData Corporation
import { withCaching, RecommendedCachingConfiguration } from "@gooddata/sdk-backend-base";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import tigerFactory, { TigerTokenAuthProvider } from "@gooddata/sdk-backend-tiger";

export function createBackend(): IAnalyticalBackend {
    return withCaching(
        tigerFactory().withAuthentication(new TigerTokenAuthProvider(import.meta.env.VITE_TIGER_API_TOKEN)),
        RecommendedCachingConfiguration,
    );
}
