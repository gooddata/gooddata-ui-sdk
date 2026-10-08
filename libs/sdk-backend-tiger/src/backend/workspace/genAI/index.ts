// (C) 2024-2026 GoodData Corporation

import { SmartFunctionsAi_ResolveLlmProviders } from "@gooddata/api-client-tiger";
import {
    type GenAiApiSummarizeRequest,
    type GenAiApiSummarizeResponse,
    type GenAiApiSummarizeVisualizationsRequest,
    GenAiApi_SummarizeDashboard,
    GenAiApi_SummarizeVisualizations,
} from "@gooddata/api-client-tiger/endpoints/genAI";
import type {
    IAnalyticsCatalogService,
    IChatConversations,
    IDashboardSummary,
    IDashboardSummaryRequest,
    IGenAIService,
    IKnowledgeDocumentsService,
    IMemoryItemsService,
    ISemanticQualityService,
    ISemanticSearchQuery,
    IVisualizationsSummaryRequest,
} from "@gooddata/sdk-backend-spi";

import { type DateNormalizer } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { convertFilter } from "../../../convertors/toBackend/afm/FilterConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { AnalyticsCatalogService } from "./AnalyticsCatalogService.js";
import { ChatConversationsService } from "./ChatConversations.js";
import { KnowledgeDocumentsService } from "./KnowledgeDocumentsService.js";
import { MemoryItemsService } from "./MemoryItemsService.js";
import { SemanticQualityService } from "./SemanticQualityService.js";
import { SemanticSearchQuery } from "./SemanticSearchQuery.js";

export class GenAIService implements IGenAIService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
        private readonly dateNormalizer: DateNormalizer,
    ) {}

    getChatConversations(options?: { isPreview?: boolean }): IChatConversations {
        return new ChatConversationsService(this.authCall, this.workspaceId, this.dateNormalizer, options);
    }

    getSemanticSearchQuery(): ISemanticSearchQuery {
        return new SemanticSearchQuery(this.authCall, this.workspaceId);
    }

    async getLlmConfigured(): Promise<boolean> {
        const result = await this.authCall((client) =>
            SmartFunctionsAi_ResolveLlmProviders(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
            }),
        );
        return Boolean(result.data.data);
    }

    getKnowledgeDocuments(): IKnowledgeDocumentsService {
        return new KnowledgeDocumentsService(this.authCall, this.workspaceId);
    }

    getMemoryItems(): IMemoryItemsService {
        return new MemoryItemsService(this.authCall, this.workspaceId);
    }

    getAnalyticsCatalog(): IAnalyticsCatalogService {
        return new AnalyticsCatalogService(this.authCall, this.workspaceId);
    }

    getSemanticQuality(): ISemanticQualityService {
        return new SemanticQualityService(this.authCall, this.workspaceId);
    }

    async summarizeDashboard(
        request: IDashboardSummaryRequest,
        options?: { signal?: AbortSignal },
    ): Promise<IDashboardSummary> {
        // Only forward optional parameters the caller actually provided, so the backend applies
        // its own defaults for the rest instead of receiving explicit `undefined`s.
        const aiSummarizeRequest: GenAiApiSummarizeRequest = {
            dashboardId: request.dashboardId,
        };
        if (request.visualizations !== undefined) {
            aiSummarizeRequest.visualizations = request.visualizations;
        }
        if (request.filterContext !== undefined) {
            // Cast bridges our SPI filter model to the generated union type.
            aiSummarizeRequest.filterContext =
                request.filterContext as GenAiApiSummarizeRequest["filterContext"];
        }
        if (request.tabId !== undefined) {
            aiSummarizeRequest.tabId = request.tabId;
        }
        if (request.formatHint !== undefined) {
            aiSummarizeRequest.formatHint = request.formatHint;
        }

        const response = await this.authCall((client) =>
            GenAiApi_SummarizeDashboard(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspaceId,
                    aiSummarizeRequest,
                },
                { signal: options?.signal },
            ),
        );

        return convertSummaryResponse(response.data);
    }

    async summarizeVisualizations(
        request: IVisualizationsSummaryRequest,
        options?: { signal?: AbortSignal },
    ): Promise<IDashboardSummary> {
        const aiSummarizeVisualizationsRequest: GenAiApiSummarizeVisualizationsRequest = {
            visualizations: request.visualizations,
            // Cast bridges the AFM filter definitions to the generated union type of the AI API.
            filterContext: request.filters
                .map((filter) => convertFilter(filter))
                .filter(Boolean) as GenAiApiSummarizeVisualizationsRequest["filterContext"],
        };
        if (request.formatHint !== undefined) {
            aiSummarizeVisualizationsRequest.formatHint = request.formatHint;
        }

        const response = await this.authCall((client) =>
            GenAiApi_SummarizeVisualizations(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspaceId,
                    aiSummarizeVisualizationsRequest,
                },
                { signal: options?.signal },
            ),
        );

        return convertSummaryResponse(response.data);
    }
}

function convertSummaryResponse(data: GenAiApiSummarizeResponse): IDashboardSummary {
    return {
        summary: data.summary,
        filterContext: data.filterContext as unknown as IDashboardSummary["filterContext"],
        visualizationsIncluded: data.visualizationsIncluded.map((v) => ({
            visualizationId: v.visualizationId,
            title: v.title,
        })),
        visualizationsExcluded: data.visualizationsExcluded.map((v) => ({
            visualizationId: v.visualizationId,
            reason: v.reason,
            title: v.title,
        })),
        generatedAt: data.generatedAt,
        tabId: data.tabId ?? undefined,
    };
}
