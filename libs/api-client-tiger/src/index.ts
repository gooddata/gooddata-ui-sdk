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
    tigerWorkspaceObjectsClientFactory,
    MetadataConfiguration,
    MetadataConfigurationParameters,
    MetadataBaseApi,
    MetadataRequestArgs,
} from "./workspaceObjects";
import { tigerOrganizationObjectsClientFactory } from "./organizationObjects";
import { tigerValidObjectsClientFactory } from "./validObjects";
import {
    axios as defaultAxios,
    newAxios,
    setAxiosAuthorizationToken,
    setGlobalAuthorizationToken,
} from "./axios";

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

export { newAxios, setAxiosAuthorizationToken, setGlobalAuthorizationToken };

export * from "./generated/afm-rest-api/api";
export * from "./generated/metadata-json-api/api";

export {
    tigerWorkspaceObjectsClientFactory,
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
    tigerOrganizationObjectsClientFactory,
};

export interface ITigerClient {
    axios: AxiosInstance;
    workspaceObjects: ReturnType<typeof tigerWorkspaceObjectsClientFactory>;
    execution: ReturnType<typeof tigerExecutionClientFactory>;
    labelElements: ReturnType<typeof tigerLabelElementsClientFactory>;
    validObjects: ReturnType<typeof tigerValidObjectsClientFactory>;
    organizationObjects: ReturnType<typeof tigerOrganizationObjectsClientFactory>;

    /**
     * Updates tiger client to send the provided API TOKEN in `Authorization` header of all
     * requests.
     *
     * @remarks This is a convenience method that ultimately calls {@link setAxiosAuthorizationToken}.
     * @param token - token to set, if undefined, it will reset
     */
    setApiToken: (token: string | undefined) => void;
}

/**
 * Tiger execution client
 *
 */
export const tigerClientFactory = (axios: AxiosInstance): ITigerClient => {
    const execution = tigerExecutionClientFactory(axios);
    const labelElements = tigerLabelElementsClientFactory(axios);
    const workspaceObjects = tigerWorkspaceObjectsClientFactory(axios);
    const validObjects = tigerValidObjectsClientFactory(axios);
    const organizationObjects = tigerOrganizationObjectsClientFactory(axios);

    return {
        axios,
        execution,
        labelElements,
        workspaceObjects,
        validObjects,
        organizationObjects,
        setApiToken: (token: string | undefined): void => {
            setAxiosAuthorizationToken(axios, token);
        },
    };
};

const defaultTigerClient = tigerClientFactory(defaultAxios);

export default defaultTigerClient;

export const JSON_API_HEADER_VALUE = "application/vnd.gooddata.api+json";

export const jsonApiHeaders = {
    Accept: JSON_API_HEADER_VALUE,
    "Content-Type": JSON_API_HEADER_VALUE,
};
