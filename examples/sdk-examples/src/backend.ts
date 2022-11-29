// (C) 2019-2022 GoodData Corporation
import bearFactory, { AnonymousAuthProvider } from "@gooddata/sdk-backend-bear";
import { withCaching, RecommendedCachingConfiguration } from "@gooddata/sdk-backend-base";

const authProvider = new AnonymousAuthProvider();

export const backend = withCaching(
    bearFactory().withAuthentication(authProvider),
    RecommendedCachingConfiguration,
);
