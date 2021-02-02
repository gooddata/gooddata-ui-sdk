// (C) 2019-2021 GoodData Corporation
import { AxiosInstance } from "axios";
import { tigerExecutionClientFactory } from "./execution";
import {
    tigerLabelElementsClientFactory,
    LabelElementsConfiguration,
    LabelElementsConfigurationParameters,
    LabelElementsBaseApi,
    LabelElementsRequestArgs,
} from "./labelElements";
import {
    tigerWorkspaceModelClientFactory,
    MetadataConfiguration,
    MetadataConfigurationParameters,
    MetadataBaseApi,
    MetadataRequestArgs,
} from "./workspaceModel";
import { tigerValidObjectsClientFactory } from "./validObjects";
import { axios as defaultAxios, newAxios } from "./axios";

export { VisualizationObjectModel } from "./gd-tiger-model/VisualizationObjectModel";
export { AnalyticalDashboardObjectModel } from "./gd-tiger-model/AnalyticalDashboardObjectModel";

export {
    isAttributeHeader,
    isObjectIdentifier,
    isResultAttributeHeader,
    isVisualizationObjectsItem,
    isFilterContextData,
    ResultDimensionHeader,
} from "./gd-tiger-model/typeGuards";

export { newAxios };

export * from "./generated/afm-rest-api/api";
export * from "./generated/metadata-json-api/api";

export {
    tigerWorkspaceModelClientFactory,
    MetadataConfiguration,
    MetadataConfigurationParameters,
    MetadataBaseApi,
    MetadataRequestArgs,
    tigerExecutionClientFactory,
    tigerLabelElementsClientFactory,
    LabelElementsConfiguration,
    LabelElementsConfigurationParameters,
    LabelElementsBaseApi,
    LabelElementsRequestArgs,
    tigerValidObjectsClientFactory,
};

export interface ITigerClient {
    workspaceModel: ReturnType<typeof tigerWorkspaceModelClientFactory>;
    execution: ReturnType<typeof tigerExecutionClientFactory>;
    labelElements: ReturnType<typeof tigerLabelElementsClientFactory>;
    validObjects: ReturnType<typeof tigerValidObjectsClientFactory>;
}

/**
 * Tiger execution client
 *
 */
export const tigerClientFactory = (axios: AxiosInstance): ITigerClient => {
    const execution = tigerExecutionClientFactory(axios);
    const labelElements = tigerLabelElementsClientFactory(axios);
    const workspaceModel = tigerWorkspaceModelClientFactory(axios);
    const validObjects = tigerValidObjectsClientFactory(axios);

    return {
        execution,
        labelElements,
        workspaceModel,
        validObjects,
    };
};

const defaultTigerClient = tigerClientFactory(defaultAxios);

export default defaultTigerClient;

export const JSON_API_HEADER_VALUE = "application/vnd.gooddata.api+json";

export const jsonApiHeaders = {
    Accept: JSON_API_HEADER_VALUE,
    "Content-Type": JSON_API_HEADER_VALUE,
};
