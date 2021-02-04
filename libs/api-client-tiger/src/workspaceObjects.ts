// (C) 2019-2020 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    WorkspaceObjectControllerApi,
    WorkspaceObjectControllerApiInterface,
    Configuration,
    ConfigurationParameters,
} from "./generated/metadata-json-api";
import { BaseAPI, RequestArgs } from "./generated/metadata-json-api/base";

export {
    Configuration as MetadataConfiguration,
    ConfigurationParameters as MetadataConfigurationParameters,
    BaseAPI as MetadataBaseApi,
    RequestArgs as MetadataRequestArgs,
};

export const tigerWorkspaceObjectsClientFactory = (
    axios: AxiosInstance,
): WorkspaceObjectControllerApiInterface => new WorkspaceObjectControllerApi({}, "", axios);
