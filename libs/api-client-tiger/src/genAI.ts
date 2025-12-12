// (C) 2019-2025 GoodData Corporation

import { type AxiosInstance } from "axios";

import { ActionsApi, type ActionsApiInterface } from "./generated/afm-rest-api/index.js";

/**
 * Tiger GenAI client factory
 */
export const tigerGenAIClientFactory = (
    axios: AxiosInstance,
): Pick<
    ActionsApiInterface,
    | "aiSearch"
    | "aiChat"
    | "aiChatStream"
    | "aiChatHistory"
    | "validateLLMEndpoint"
    | "validateLLMEndpointById"
    | "getQualityIssues"
    | "getQualityIssuesCalculationStatus"
    | "triggerQualityIssuesCalculation"
    | "tags"
    | "createdBy"
    | "memoryCreatedByUsers"
> => new ActionsApi(undefined, "", axios);
