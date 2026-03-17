// (C) 2025-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

import type { AxiosInstance, AxiosPromise, AxiosRequestConfig } from "axios";

import {
    type ActionsApiAiChatHistoryRequest,
    type ActionsApiAiChatRequest,
    type ActionsApiAiChatStreamRequest,
    type ActionsApiAiSearchRequest,
    type ActionsApiCreatedByRequest,
    type ActionsApiGetQualityIssuesRequest,
    type ActionsApiListLlmProviderModelsByIdRequest,
    type ActionsApiListLlmProviderModelsRequest,
    type ActionsApiMemoryCreatedByUsersRequest,
    type ActionsApiTagsRequest,
    type ActionsApiTestLlmProviderByIdRequest,
    type ActionsApiTestLlmProviderRequest,
    type ActionsApiTriggerQualityIssuesCalculationRequest,
    type ActionsApiValidateLLMEndpointByIdRequest,
    type ActionsApiValidateLLMEndpointRequest,
    ActionsApi_AiChat,
    ActionsApi_AiChatHistory,
    ActionsApi_AiChatStream,
    ActionsApi_AiSearch,
    ActionsApi_CreatedBy,
    ActionsApi_GetQualityIssues,
    ActionsApi_GetQualityIssuesCalculationStatus,
    ActionsApi_ListLlmProviderModels,
    ActionsApi_ListLlmProviderModelsById,
    ActionsApi_MemoryCreatedByUsers,
    ActionsApi_Tags,
    ActionsApi_TestLlmProvider,
    ActionsApi_TestLlmProviderById,
    ActionsApi_TriggerQualityIssuesCalculation,
    ActionsApi_ValidateLLMEndpoint,
    ActionsApi_ValidateLLMEndpointById,
    type TrendingObjectsResult,
} from "../../generated/afm-rest-api/index.js";

// GenAI API - Export GenAI-related ActionsApi functions with GenAiApi_ prefix
export {
    ActionsApi_AiSearch as GenAiApi_AiSearch,
    type ActionsApiAiSearchRequest as GenAiApiAiSearchRequest,
    ActionsApi_AiChat as GenAiApi_AiChat,
    type ActionsApiAiChatRequest as GenAiApiAiChatRequest,
    ActionsApi_AiChatHistory as GenAiApi_AiChatHistory,
    type ActionsApiAiChatHistoryRequest as GenAiApiAiChatHistoryRequest,
    ActionsApi_AiChatStream as GenAiApi_AiChatStream,
    type ActionsApiAiChatStreamRequest as GenAiApiAiChatStreamRequest,
    ActionsApi_ValidateLLMEndpoint as GenAiApi_ValidateLLMEndpoint,
    type ActionsApiValidateLLMEndpointRequest as GenAiApiValidateLLMEndpointRequest,
    ActionsApi_ValidateLLMEndpointById as GenAiApi_ValidateLLMEndpointById,
    type ActionsApiValidateLLMEndpointByIdRequest as GenAiApiValidateLLMEndpointByIdRequest,
    ActionsApi_GetQualityIssues as GenAiApi_GetQualityIssues,
    type ActionsApiGetQualityIssuesRequest as GenAiApiGetQualityIssuesRequest,
    ActionsApi_GetQualityIssuesCalculationStatus as GenAiApi_GetQualityIssuesCalculationStatus,
    ActionsApi_TriggerQualityIssuesCalculation as GenAiApi_TriggerQualityIssuesCalculation,
    type ActionsApiTriggerQualityIssuesCalculationRequest as GenAiApiTriggerQualityIssuesCalculationRequest,
    ActionsApi_Tags as GenAiApi_Tags,
    type ActionsApiTagsRequest as GenAiApiTagsRequest,
    ActionsApi_CreatedBy as GenAiApi_CreatedBy,
    type ActionsApiCreatedByRequest as GenAiApiCreatedByRequest,
    ActionsApi_MemoryCreatedByUsers as GenAiApi_MemoryCreatedByUsers,
    type ActionsApiMemoryCreatedByUsersRequest as GenAiApiMemoryCreatedByUsersRequest,
    ActionsApi_TestLlmProvider as GenAiApi_TestLlmProvider,
    type ActionsApiTestLlmProviderRequest as GenAiApiTestLlmProviderRequest,
    ActionsApi_TestLlmProviderById as GenAiApi_TestLlmProviderById,
    type ActionsApiTestLlmProviderByIdRequest as GenAiApiTestLlmProviderByIdRequest,
    ActionsApi_ListLlmProviderModels,
    type ActionsApiListLlmProviderModelsRequest,
    ActionsApi_ListLlmProviderModelsById,
    type ActionsApiListLlmProviderModelsByIdRequest,
};

export type GenAiApiTrendingObjectsRequest = {
    readonly workspaceId: string;
};

export async function GenAiApi_TrendingObjects(
    axios: AxiosInstance,
    basePath: string,
    requestParameters: GenAiApiTrendingObjectsRequest,
    options: AxiosRequestConfig = {},
): Promise<AxiosPromise<TrendingObjectsResult>> {
    const workspaceId = encodeURIComponent(String(requestParameters.workspaceId));
    const url = `${basePath}/api/v1/actions/workspaces/${workspaceId}/ai/analyticsCatalog/trendingObjects`;

    return axios.request<TrendingObjectsResult>({
        ...options,
        method: "GET",
        url,
    });
}
