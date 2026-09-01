// (C) 2019-2026 GoodData Corporation

import { type AxiosInstance } from "axios";

import { ActionsApi, type ActionsApiInterface } from "./generated/afm-rest-api/index.js";
import {
    ObservabilityAi,
    type ObservabilityAiInterface,
    SmartFunctionsAi,
    type SmartFunctionsAiInterface,
} from "./generated/ai-json-api/index.js";

/**
 * Tiger GenAI client factory
 */
export type TigerGenAIClient = Pick<
    ActionsApiInterface,
    | "aiChat"
    | "aiChatStream"
    | "aiChatHistory"
    | "validateLLMEndpoint"
    | "validateLLMEndpointById"
    | "getQualityIssues"
    | "getQualityIssuesCalculationStatus"
    | "triggerQualityIssuesCalculation"
    | "memoryCreatedByUsers"
> &
    Pick<SmartFunctionsAiInterface, "aiSearch"> &
    Pick<ObservabilityAiInterface, "getObservabilityOverview">;

export const tigerGenAIClientFactory = (axios: AxiosInstance): TigerGenAIClient => {
    const actionsApi = new ActionsApi(undefined, "", axios);
    const observabilityApi = new ObservabilityAi(undefined, "", axios);
    const smartFunctionsApi = new SmartFunctionsAi(undefined, "", axios);

    return {
        aiSearch: smartFunctionsApi.aiSearch.bind(smartFunctionsApi),
        aiChat: actionsApi.aiChat.bind(actionsApi),
        aiChatStream: actionsApi.aiChatStream.bind(actionsApi),
        aiChatHistory: actionsApi.aiChatHistory.bind(actionsApi),
        validateLLMEndpoint: actionsApi.validateLLMEndpoint.bind(actionsApi),
        validateLLMEndpointById: actionsApi.validateLLMEndpointById.bind(actionsApi),
        getQualityIssues: actionsApi.getQualityIssues.bind(actionsApi),
        getQualityIssuesCalculationStatus: actionsApi.getQualityIssuesCalculationStatus.bind(actionsApi),
        triggerQualityIssuesCalculation: actionsApi.triggerQualityIssuesCalculation.bind(actionsApi),
        memoryCreatedByUsers: actionsApi.memoryCreatedByUsers.bind(actionsApi),
        getObservabilityOverview: observabilityApi.getObservabilityOverview.bind(observabilityApi),
    };
};
