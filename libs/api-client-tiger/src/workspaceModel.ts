// (C) 2019-2020 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    WorkspaceModelControllerApi,
    WorkspaceModelControllerApiInterface,
    Configuration,
    ConfigurationParameters,
} from "./generated/metadata-new-json-api";
import { BaseAPI, RequestArgs } from "./generated/metadata-new-json-api/base";

export {
    Configuration as MetadataNewConfiguration,
    ConfigurationParameters as MetadataNewConfigurationParameters,
    BaseAPI as MetadataNewBaseApi,
    RequestArgs as MetadataNewRequestArgs,
};

// TODO consider to add clients for other controllers
// Right now only the workspace model is utilized (to work with LDM and analytics objects)
export const tigerWorkspaceModelClientFactory = (
    axios: AxiosInstance,
): WorkspaceModelControllerApiInterface => new WorkspaceModelControllerApi({}, "", axios);
