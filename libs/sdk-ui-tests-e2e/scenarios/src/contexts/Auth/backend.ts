// (C) 2022-2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withCaching, RecommendedCachingConfiguration } from "@gooddata/sdk-backend-base";

export function createBackend(): IAnalyticalBackend {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tiger = require("@gooddata/sdk-backend-tiger");
    const { default: tigerFactory, TigerTokenAuthProvider } = tiger;
    return withCaching(
        tigerFactory().withAuthentication(new TigerTokenAuthProvider(process.env.TIGER_API_TOKEN!)),
        RecommendedCachingConfiguration,
    );
}
