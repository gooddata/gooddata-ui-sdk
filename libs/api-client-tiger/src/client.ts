// (C) 2019-2025 GoodData Corporation
import { tigerExecutionClientFactory } from "./execution.js";
import { tigerExecutionResultClientFactory } from "./executionResult.js";
import {
    LabelElementsConfiguration,
    LabelElementsConfigurationParameters,
    LabelElementsBaseApi,
    LabelElementsRequestArgs,
    tigerLabelElementsClientFactory,
} from "./labelElements.js";

import { tigerValidObjectsClientFactory } from "./validObjects.js";
import { setAxiosAuthorizationToken } from "./axios.js";
import { AxiosInstance } from "axios";
import { tigerLayoutClientFactory } from "./layout.js";
import { tigerAfmExplainClientFactory } from "./explain.js";
import { tigerActionsClientFactory } from "./actions.js";
import { tigerAuthActionsClientFactory } from "./authActions.js";

import {
    MetadataConfiguration,
    MetadataConfigurationParameters,
    MetadataBaseApi,
    MetadataRequestArgs,
    tigerEntitiesObjectsClientFactory,
} from "./entitiesObjects.js";
import {
    tigerProfileClientFactory,
    IUserProfile,
    ProfileApiInterface,
    ILiveFeatures,
    IStaticFeatures,
    FeatureContext,
    isLiveFeatures,
    isStaticFeatures,
} from "./profile.js";
import { tigerExportClientFactory } from "./export.js";
import {
    ScanModelConfiguration,
    ScanModelConfigurationParameters,
    ScanModelBaseApi,
    ScanModelRequestArgs,
    ScanModelActionsApiInterface,
    tigerScanModelClientFactory,
} from "./scanModel.js";
import { tigerValidDescendantsClientFactory } from "./validDescendants.js";
import { tigerResultClientFactory, ResultActionsApiInterface } from "./result.js";
import { tigerUserManagementClientFactory } from "./userManagement.js";
import { tigerSmartFunctionsClientFactory } from "./smartFunctions.js";
import { tigerGenAIClientFactory } from "./genAI.js";
import { tigerAutomationClientFactory } from "./automation.js";

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
    ScanModelConfigurationParameters,
    ScanModelRequestArgs,
    ScanModelActionsApiInterface,
    ResultActionsApiInterface,
};
export {
    tigerExecutionClientFactory,
    tigerEntitiesObjectsClientFactory,
    tigerExecutionResultClientFactory,
    tigerLabelElementsClientFactory,
    tigerValidObjectsClientFactory,
    tigerValidDescendantsClientFactory,
    tigerLayoutClientFactory,
    tigerAfmExplainClientFactory,
    tigerProfileClientFactory,
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

export interface ITigerClient {
    axios: AxiosInstance;
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
    actions: ReturnType<typeof tigerActionsClientFactory>;
    authActions: ReturnType<typeof tigerAuthActionsClientFactory>;
    scanModel: ReturnType<typeof tigerScanModelClientFactory>;
    export: ReturnType<typeof tigerExportClientFactory>;
    result: ReturnType<typeof tigerResultClientFactory>;
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
    const actions = tigerActionsClientFactory(axios);
    const authActions = tigerAuthActionsClientFactory(axios);
    const scanModel = tigerScanModelClientFactory(axios);
    const exportFactory = tigerExportClientFactory(axios);
    const result = tigerResultClientFactory(axios);
    const userManagement = tigerUserManagementClientFactory(axios);
    const smartFunctions = tigerSmartFunctionsClientFactory(axios);
    const genAI = tigerGenAIClientFactory(axios);
    const automation = tigerAutomationClientFactory(axios);

    return {
        axios,
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
    };
};
