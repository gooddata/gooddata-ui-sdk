// (C) 2022-2025 GoodData Corporation

import { RecommendedCachingConfiguration, withCaching } from "@gooddata/sdk-backend-base";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export function createBackend(): IAnalyticalBackend {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tiger = require("@gooddata/sdk-backend-tiger");
    const { default: tigerFactory, TigerTokenAuthProvider } = tiger;
    return withCaching(
        tigerFactory().withAuthentication(new TigerTokenAuthProvider(process.env.TIGER_API_TOKEN!)),
        RecommendedCachingConfiguration,
    );
}
