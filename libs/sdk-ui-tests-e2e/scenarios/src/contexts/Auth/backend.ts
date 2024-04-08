// (C) 2022-2024 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export function createBackend(): IAnalyticalBackend {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tiger = require("@gooddata/sdk-backend-tiger");
    const { default: tigerFactory, TigerTokenAuthProvider } = tiger;
    return tigerFactory().withAuthentication(new TigerTokenAuthProvider(process.env.TIGER_API_TOKEN!));
}
