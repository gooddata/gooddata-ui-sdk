// (C) 2019-2025 GoodData Corporation
import { AxiosInstance } from "axios";

import { BaseAPI, RequestArgs } from "./generated/metadata-json-api/base.js";
import {
    Configuration,
    ConfigurationParameters,
    EntitiesApi,
    EntitiesApiInterface,
} from "./generated/metadata-json-api/index.js";

export type {
    ConfigurationParameters as MetadataConfigurationParameters,
    RequestArgs as MetadataRequestArgs,
};
export { Configuration as MetadataConfiguration, BaseAPI as MetadataBaseApi };

export const tigerEntitiesObjectsClientFactory = (axios: AxiosInstance): EntitiesApiInterface =>
    new EntitiesApi(undefined, "", axios);
