// (C) 2019-2020 GoodData Corporation
import { AxiosInstance } from "axios";
import { tigerExecutionClientFactory } from "./execution";
import { tigerMetadataClientFactory } from "./metadata";
import { axios as defaultAxios, newAxios } from "./axios";

export { ExecuteAFM } from "./gd-tiger-model/ExecuteAFM";
export { Execution } from "./gd-tiger-model/Execution";

export { newAxios };

export * from "./generated/api";

export interface ITigerClient {
    metadata: ReturnType<typeof tigerMetadataClientFactory>;
    execution: ReturnType<typeof tigerExecutionClientFactory>;
}

/**
 * Tiger execution client
 *
 */
export const tigerClientFactory = (axios: AxiosInstance): ITigerClient => {
    const execution = tigerExecutionClientFactory(axios);
    const metadata = tigerMetadataClientFactory(axios);

    return {
        execution,
        metadata,
    };
};

const defaultTigerClient = tigerClientFactory(defaultAxios);

export default defaultTigerClient;
