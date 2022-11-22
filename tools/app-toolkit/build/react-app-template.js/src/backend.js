// (C) 2022 GoodData Corporation

import { withCaching, RecommendedCachingConfiguration } from "@gooddata/sdk-backend-base";
import bearFactory, { AnonymousAuthProvider } from "@gooddata/sdk-backend-bear";

export const backend = withCaching(
    bearFactory().withAuthentication(new AnonymousAuthProvider()),
    RecommendedCachingConfiguration,
);
