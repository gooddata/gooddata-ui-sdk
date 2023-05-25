// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    EntitiesApiFactory,
    EntitiesApiInterface,
    Configuration,
    ConfigurationParameters,
} from "./generated/metadata-json-api/index.js";

import { BaseAPI, RequestArgs } from "./generated/metadata-json-api/base.js";

export {
    Configuration as MetadataConfiguration,
    ConfigurationParameters as MetadataConfigurationParameters,
    BaseAPI as MetadataBaseApi,
    RequestArgs as MetadataRequestArgs,
};

export const tigerEntitiesObjectsClientFactory = (axios: AxiosInstance): EntitiesApiInterface =>
    EntitiesApiFactory(undefined, "", axios);
