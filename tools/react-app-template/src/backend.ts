// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withCaching, RecommendedCachingConfiguration } from "@gooddata/sdk-backend-base";
import bearFactory, { AnonymousAuthProvider } from "@gooddata/sdk-backend-bear";

export const backend: IAnalyticalBackend = withCaching(
    bearFactory().withAuthentication(new AnonymousAuthProvider()),
    RecommendedCachingConfiguration,
);
