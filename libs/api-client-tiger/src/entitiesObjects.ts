// (C) 2019-2024 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    EntitiesApiFactory,
    EntitiesApiInterface,
    Configuration,
    ConfigurationParameters,
} from "./generated/metadata-json-api/index.js";

import { BaseAPI, RequestArgs } from "./generated/metadata-json-api/base.js";

export type {
    ConfigurationParameters as MetadataConfigurationParameters,
    RequestArgs as MetadataRequestArgs,
};
export { Configuration as MetadataConfiguration, BaseAPI as MetadataBaseApi };

export const tigerEntitiesObjectsClientFactory = (axios: AxiosInstance): EntitiesApiInterface =>
    EntitiesApiFactory(undefined, "", axios);
