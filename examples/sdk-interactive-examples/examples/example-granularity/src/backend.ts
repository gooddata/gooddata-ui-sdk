// (C) 2024-2025 GoodData Corporation
import { RecommendedCachingConfiguration, withCaching } from "@gooddata/sdk-backend-base";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ContextDeferredAuthProvider, tigerFactory } from "@gooddata/sdk-backend-tiger";

// Configure backend connection with context deferred auth provider.
// See our docs on complete auth setup:
// https://www.gooddata.com/docs/gooddata-ui/latest/learn/integrate_and_authenticate/cn_and_cloud_authentication/
export const backend: IAnalyticalBackend = withCaching(
    tigerFactory().withAuthentication(new ContextDeferredAuthProvider()),
    RecommendedCachingConfiguration,
);
