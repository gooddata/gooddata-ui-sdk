// (C) 2022-2025 GoodData Corporation
import { RecommendedCachingConfiguration, withCaching } from "@gooddata/sdk-backend-base";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import backendFactory, { ContextDeferredAuthProvider } from "@gooddata/sdk-backend-tiger";

// Configure backend connection with context deferred auth provider.
// See our docs on complete auth setup:
// https://sdk.gooddata.com/gooddata-ui/docs/cloudnative_authentication.html
export const backend: IAnalyticalBackend = withCaching(
    backendFactory().withAuthentication(new ContextDeferredAuthProvider()),
    RecommendedCachingConfiguration,
);
