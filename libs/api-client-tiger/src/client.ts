// (C) 2019-2022 GoodData Corporation
import { tigerExecutionClientFactory } from "./execution";
import { tigerExecutionResultClientFactory } from "./executionResult";
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
import { tigerLayoutClientFactory } from "./layout";
import { tigerAfmExplainClientFactory } from "./explain";
import { tigerEntitiesObjectsClientFactory } from "./entitiesObjects";

export {
    tigerWorkspaceObjectsClientFactory,
    tigerExecutionClientFactory,
    tigerEntitiesObjectsClientFactory,
    tigerExecutionResultClientFactory,
    tigerLabelElementsClientFactory,
    tigerValidObjectsClientFactory,
    tigerOrganizationObjectsClientFactory,
    tigerLayoutClientFactory,
    tigerAfmExplainClientFactory,
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
    execution: ReturnType<typeof tigerExecutionClientFactory>;
    executionResult: ReturnType<typeof tigerExecutionResultClientFactory>;
    labelElements: ReturnType<typeof tigerLabelElementsClientFactory>;
    validObjects: ReturnType<typeof tigerValidObjectsClientFactory>;
    explain: ReturnType<typeof tigerAfmExplainClientFactory>;
    declarativeLayout: ReturnType<typeof tigerLayoutClientFactory>;
    entities: ReturnType<typeof tigerEntitiesObjectsClientFactory>;

    /**
     * @deprecated use entities {@link ITigerClient.entities} instead
     */
    workspaceObjects: ReturnType<typeof tigerWorkspaceObjectsClientFactory>;

    /**
     * @deprecated  use entities {@link  ITigerClient.entities} instead
     */
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
    const executionResult = tigerExecutionResultClientFactory(axios);
    const labelElements = tigerLabelElementsClientFactory(axios);
    const workspaceObjects = tigerWorkspaceObjectsClientFactory(axios);
    const validObjects = tigerValidObjectsClientFactory(axios);
    const organizationObjects = tigerOrganizationObjectsClientFactory(axios);
    const declarativeLayout = tigerLayoutClientFactory(axios);
    const explain = tigerAfmExplainClientFactory(axios);
    const entities = tigerEntitiesObjectsClientFactory(axios);

    return {
        axios,
        execution,
        executionResult,
        labelElements,
        workspaceObjects,
        validObjects,
        organizationObjects,
        declarativeLayout,
        explain,
        entities,
        setApiToken: (token: string | undefined): void => {
            setAxiosAuthorizationToken(axios, token);
        },
    };
};
