// (C) 2019-2025 GoodData Corporation

import { type AxiosInstance } from "axios";

import { tigerActionsClientFactory } from "./actions.js";
import { tigerAuthActionsClientFactory } from "./authActions.js";
import { tigerAutomationClientFactory } from "./automation.js";
import { setAxiosAuthorizationToken } from "./axios.js";
import {
    MetadataBaseApi,
    MetadataConfiguration,
    type MetadataConfigurationParameters,
    type MetadataRequestArgs,
    tigerEntitiesObjectsClientFactory,
} from "./entitiesObjects.js";
import { tigerExecutionClientFactory } from "./execution.js";
import { tigerExecutionResultClientFactory } from "./executionResult.js";
import { tigerAfmExplainClientFactory } from "./explain.js";
import { tigerExportClientFactory } from "./export.js";
import { tigerGenAIClientFactory } from "./genAI.js";
import {
    LabelElementsBaseApi,
    LabelElementsConfiguration,
    type LabelElementsConfigurationParameters,
    type LabelElementsRequestArgs,
    tigerLabelElementsClientFactory,
} from "./labelElements.js";
import { tigerLayoutClientFactory } from "./layout.js";
import {
    type LocationStyleApiInterface,
    type LocationStyleDocument,
    tigerLocationStyleClientFactory,
} from "./locationStyle.js";
import {
    type FeatureContext,
    type ILiveFeatures,
    type IStaticFeatures,
    type IUserProfile,
    type ProfileApiInterface,
    isLiveFeatures,
    isStaticFeatures,
    tigerProfileClientFactory,
} from "./profile.js";
import {
    type ResultActionsApiInterface,
    tigerGeoCollectionsClientFactory,
    tigerResultClientFactory,
} from "./result.js";
import {
    type ScanModelActionsApiInterface,
    ScanModelBaseApi,
    ScanModelConfiguration,
    type ScanModelConfigurationParameters,
    type ScanModelRequestArgs,
    tigerScanModelClientFactory,
} from "./scanModel.js";
import { tigerSmartFunctionsClientFactory } from "./smartFunctions.js";
import { tigerUserManagementClientFactory } from "./userManagement.js";
import { tigerValidDescendantsClientFactory } from "./validDescendants.js";
import { tigerValidObjectsClientFactory } from "./validObjects.js";

export type {
    MetadataConfigurationParameters,
    MetadataRequestArgs,
    LabelElementsConfigurationParameters,
    LabelElementsRequestArgs,
    ProfileApiInterface,
    IUserProfile,
    ILiveFeatures,
    IStaticFeatures,
    FeatureContext,
    LocationStyleApiInterface,
    LocationStyleDocument,
    ScanModelConfigurationParameters,
    ScanModelRequestArgs,
    ScanModelActionsApiInterface,
    ResultActionsApiInterface,
};
export {
    tigerExecutionClientFactory,
    //    tigerEntitiesObjectsClientFactory,
    tigerExecutionResultClientFactory,
    tigerLabelElementsClientFactory,
    tigerValidObjectsClientFactory,
    tigerValidDescendantsClientFactory,
    tigerLayoutClientFactory,
    tigerAfmExplainClientFactory,
    tigerProfileClientFactory,
    tigerLocationStyleClientFactory,
    tigerActionsClientFactory,
    tigerAuthActionsClientFactory,
    tigerScanModelClientFactory,
    tigerExportClientFactory,
    tigerAutomationClientFactory,
    tigerResultClientFactory,
    tigerUserManagementClientFactory,
    tigerSmartFunctionsClientFactory,
    tigerGenAIClientFactory,
    MetadataConfiguration,
    MetadataBaseApi,
    LabelElementsConfiguration,
    LabelElementsBaseApi,
    isLiveFeatures,
    isStaticFeatures,
    ScanModelConfiguration,
    ScanModelBaseApi,
};

export interface ITigerClientBase {
    axios: AxiosInstance;
    basePath: string;
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
 * Tiger client interface that contains all the factories of the tiger API.
 * This is not tree shakable client, use direct import of the api endpoints instead.
 * @deprecated Use direct import of the api endpoints instead.
 */
export interface ITigerClient extends ITigerClientBase {
    automation: ReturnType<typeof tigerAutomationClientFactory>;
    execution: ReturnType<typeof tigerExecutionClientFactory>;
    executionResult: ReturnType<typeof tigerExecutionResultClientFactory>;
    labelElements: ReturnType<typeof tigerLabelElementsClientFactory>;
    validObjects: ReturnType<typeof tigerValidObjectsClientFactory>;
    validDescendants: ReturnType<typeof tigerValidDescendantsClientFactory>;
    explain: ReturnType<typeof tigerAfmExplainClientFactory>;
    declarativeLayout: ReturnType<typeof tigerLayoutClientFactory>;
    entities: ReturnType<typeof tigerEntitiesObjectsClientFactory>;
    profile: ReturnType<typeof tigerProfileClientFactory>;
    locationStyle: ReturnType<typeof tigerLocationStyleClientFactory>;
    actions: ReturnType<typeof tigerActionsClientFactory>;
    authActions: ReturnType<typeof tigerAuthActionsClientFactory>;
    scanModel: ReturnType<typeof tigerScanModelClientFactory>;
    export: ReturnType<typeof tigerExportClientFactory>;
    result: ReturnType<typeof tigerResultClientFactory>;
    geoCollections: ReturnType<typeof tigerGeoCollectionsClientFactory>;
    userManagement: ReturnType<typeof tigerUserManagementClientFactory>;

    /**
     * @beta
     */
    smartFunctions: ReturnType<typeof tigerSmartFunctionsClientFactory>;

    /**
     * @beta
     */
    genAI: ReturnType<typeof tigerGenAIClientFactory>;

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
 * @deprecated Use direct import of the api endpoints instead.
 */
export const tigerClientFactory = (axios: AxiosInstance): ITigerClient => {
    const execution = tigerExecutionClientFactory(axios);
    const executionResult = tigerExecutionResultClientFactory(axios);
    const labelElements = tigerLabelElementsClientFactory(axios);
    const validObjects = tigerValidObjectsClientFactory(axios);
    const validDescendants = tigerValidDescendantsClientFactory(axios);
    const declarativeLayout = tigerLayoutClientFactory(axios);
    const explain = tigerAfmExplainClientFactory(axios);
    const entities = tigerEntitiesObjectsClientFactory(axios);
    const profile = tigerProfileClientFactory(axios);
    const locationStyle = tigerLocationStyleClientFactory(axios);
    const actions = tigerActionsClientFactory(axios);
    const authActions = tigerAuthActionsClientFactory(axios);
    const scanModel = tigerScanModelClientFactory(axios);
    const exportFactory = tigerExportClientFactory(axios);
    const result = tigerResultClientFactory(axios);
    const userManagement = tigerUserManagementClientFactory(axios);
    const smartFunctions = tigerSmartFunctionsClientFactory(axios);
    const genAI = tigerGenAIClientFactory(axios);
    const automation = tigerAutomationClientFactory(axios);
    const geoCollections = tigerGeoCollectionsClientFactory(axios);

    return {
        axios,
        basePath: "",
        automation,
        execution,
        executionResult,
        labelElements,
        validObjects,
        validDescendants,
        declarativeLayout,
        explain,
        entities,
        profile,
        locationStyle,
        actions,
        authActions,
        scanModel,
        result,
        userManagement,
        setApiToken: (token: string | undefined): void => {
            setAxiosAuthorizationToken(axios, token);
        },
        export: exportFactory,
        smartFunctions,
        genAI,
        geoCollections,
    };
};

/**
 * Creates a base tiger client that can be used to create a tiger client. This factory is used than in
 * SDK-Backend-Tiger using this factory allow tree shaking of the client.
 * @param axios - axios instance
 * @returns ITigerClientBase
 */
export const tigerClientBaseFactory = (axios: AxiosInstance, basePath: string = ""): ITigerClientBase => {
    return {
        axios,
        basePath,
        setApiToken: (token: string | undefined): void => {
            setAxiosAuthorizationToken(axios, token);
        },
    };
};
