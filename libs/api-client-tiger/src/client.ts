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

import { tigerValidObjectsClientFactory } from "./validObjects";
import { setAxiosAuthorizationToken } from "./axios";
import { AxiosInstance } from "axios";
import { tigerLayoutClientFactory } from "./layout";
import { tigerAfmExplainClientFactory } from "./explain";

import {
    MetadataConfiguration,
    MetadataConfigurationParameters,
    MetadataBaseApi,
    MetadataRequestArgs,
    tigerEntitiesObjectsClientFactory,
} from "./entitiesObjects";
import {
    tigerProfileClientFactory,
    IUserProfile,
    ProfileApiInterface,
    ILiveFeatures,
    IStaticFeatures,
    FeatureContext,
} from "./profile";

export {
    tigerExecutionClientFactory,
    tigerEntitiesObjectsClientFactory,
    tigerExecutionResultClientFactory,
    tigerLabelElementsClientFactory,
    tigerValidObjectsClientFactory,
    tigerLayoutClientFactory,
    tigerAfmExplainClientFactory,
    tigerProfileClientFactory,
    MetadataConfiguration,
    MetadataConfigurationParameters,
    MetadataBaseApi,
    MetadataRequestArgs,
    LabelElementsConfiguration,
    LabelElementsConfigurationParameters,
    LabelElementsBaseApi,
    LabelElementsRequestArgs,
    ProfileApiInterface,
    IUserProfile,
    ILiveFeatures,
    IStaticFeatures,
    FeatureContext,
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
    profile: ReturnType<typeof tigerProfileClientFactory>;

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
    const validObjects = tigerValidObjectsClientFactory(axios);
    const declarativeLayout = tigerLayoutClientFactory(axios);
    const explain = tigerAfmExplainClientFactory(axios);
    const entities = tigerEntitiesObjectsClientFactory(axios);
    const profile = tigerProfileClientFactory(axios);

    return {
        axios,
        execution,
        executionResult,
        labelElements,
        validObjects,
        declarativeLayout,
        explain,
        entities,
        profile,
        setApiToken: (token: string | undefined): void => {
            setAxiosAuthorizationToken(axios, token);
        },
    };
};
