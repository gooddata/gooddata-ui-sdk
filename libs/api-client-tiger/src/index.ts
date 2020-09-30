// (C) 2019-2020 GoodData Corporation
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
    tigerMetadataClientFactory,
    MetadataConfiguration,
    MetadataConfigurationParameters,
    MetadataBaseApi,
    MetadataRequestArgs,
} from "./metadata";
import { tigerValidObjectsClientFactory } from "./validObjects";
import { axios as defaultAxios, newAxios } from "./axios";

export { VisualizationObject } from "./gd-tiger-model/VisualizationObject";
export * from "./gd-tiger-model/typeGuards";

export { newAxios };

export * from "./generated/afm-rest-api/api";
export * from "./generated/metadata-json-api/api";

export {
    tigerMetadataClientFactory,
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
    metadata: ReturnType<typeof tigerMetadataClientFactory>;
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
    const metadata = tigerMetadataClientFactory(axios);
    const validObjects = tigerValidObjectsClientFactory(axios);

    return {
        execution,
        labelElements,
        metadata,
        validObjects,
    };
};

const defaultTigerClient = tigerClientFactory(defaultAxios);

export default defaultTigerClient;
