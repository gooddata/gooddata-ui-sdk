// (C) 2019-2020 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    WorkspaceModelControllerApi,
    WorkspaceModelControllerApiInterface,
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

// TODO consider to add clients for other controllers
// Right now only the workspace model is utilized (to work with LDM and analytical objects)
export const tigerWorkspaceModelClientFactory = (
    axios: AxiosInstance,
): WorkspaceModelControllerApiInterface => new WorkspaceModelControllerApi({}, "", axios);
