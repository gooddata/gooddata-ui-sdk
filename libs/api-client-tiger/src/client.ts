// (C) 2019-2021 GoodData Corporation
import { tigerExecutionClientFactory } from "./execution";
import {
    LabelElementsConfiguration,
    LabelElementsConfigurationParameters,
    LabelElementsBaseApi,
    LabelElementsRequestArgs,
    tigerLabelElementsClientFactory,
} from "./labelElements";
import {
    MetadataConfiguration,
    MetadataConfigurationParameters,
    MetadataBaseApi,
    MetadataRequestArgs,
    tigerWorkspaceObjectsClientFactory,
} from "./workspaceObjects";
import { tigerValidObjectsClientFactory } from "./validObjects";
import { tigerOrganizationObjectsClientFactory } from "./organizationObjects";
import { setAxiosAuthorizationToken } from "./axios";
import { AxiosInstance } from "axios";

export {
    tigerWorkspaceObjectsClientFactory,
    tigerExecutionClientFactory,
    tigerLabelElementsClientFactory,
    tigerValidObjectsClientFactory,
    tigerOrganizationObjectsClientFactory,
    MetadataConfiguration,
    MetadataConfigurationParameters,
    MetadataBaseApi,
    MetadataRequestArgs,
    LabelElementsConfiguration,
    LabelElementsConfigurationParameters,
    LabelElementsBaseApi,
    LabelElementsRequestArgs,
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
