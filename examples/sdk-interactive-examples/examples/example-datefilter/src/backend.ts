// (C) 2024 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withCaching, RecommendedCachingConfiguration } from "@gooddata/sdk-backend-base";
import backendFactory, { ContextDeferredAuthProvider } from "@gooddata/sdk-backend-tiger";

// Configure backend connection with context deferred auth provider.
// See our docs on complete auth setup:
// https://www.gooddata.com/docs/gooddata-ui/latest/learn/integrate_and_authenticate/cn_and_cloud_authentication/
export const backend: IAnalyticalBackend = withCaching(
    backendFactory().withAuthentication(new ContextDeferredAuthProvider()),
    RecommendedCachingConfiguration,
);
