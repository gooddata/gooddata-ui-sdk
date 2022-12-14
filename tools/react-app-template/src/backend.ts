// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withCaching, RecommendedCachingConfiguration } from "@gooddata/sdk-backend-base";
import backendFactory, { AnonymousAuthProvider } from "@gooddata/sdk-backend-tiger";

export const backend: IAnalyticalBackend = withCaching(
    backendFactory().withAuthentication(new AnonymousAuthProvider()),
    RecommendedCachingConfiguration,
);
