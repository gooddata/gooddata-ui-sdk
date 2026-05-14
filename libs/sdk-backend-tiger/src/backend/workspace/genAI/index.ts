// (C) 2024-2026 GoodData Corporation

import {
    ActionsApi_MetadataSync,
    ActionsApi_ResolveLlmProviders,
} from "@gooddata/api-client-tiger/endpoints/actions";
import { GenAiApi_SummarizeDashboard } from "@gooddata/api-client-tiger/endpoints/genAI";
import type {
    IAnalyticsCatalogService,
    IChatConversations,
    IChatThread,
    IDashboardSummary,
    IDashboardSummaryRequest,
    IGenAIService,
    IKnowledgeDocumentsService,
    IMemoryItemsService,
    ISemanticQualityService,
    ISemanticSearchQuery,
} from "@gooddata/sdk-backend-spi";

import { type DateNormalizer } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { AnalyticsCatalogService } from "./AnalyticsCatalogService.js";
import { ChatConversationsService } from "./ChatConversations.js";
import { ChatThreadService } from "./ChatThread.js";
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

    getChatThread(): IChatThread {
        return new ChatThreadService(this.authCall, this.workspaceId, this.dateNormalizer);
    }

    getChatConversations(options?: { isPreview?: boolean }): IChatConversations {
        return new ChatConversationsService(this.authCall, this.workspaceId, this.dateNormalizer, options);
    }

    getSemanticSearchQuery(): ISemanticSearchQuery {
        return new SemanticSearchQuery(this.authCall, this.workspaceId);
    }

    async semanticSearchIndex(): Promise<void> {
        await this.authCall((client) =>
            ActionsApi_MetadataSync(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
            }),
        );
    }

    async getLlmConfigured(): Promise<boolean> {
        const result = await this.authCall((client) =>
            ActionsApi_ResolveLlmProviders(client.axios, client.basePath, {
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
        const response = await this.authCall((client) =>
            GenAiApi_SummarizeDashboard(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspaceId,
                    aiSummarizeRequest: {
                        dashboardId: request.dashboardId,
                        // Casts strip `| null` from our SPI types — the generated client still
                        // declares these required. Drop the casts once backend allows null.
                        visualizations: request.visualizations as string[],
                        filterContext: request.filterContext as object[],
                    },
                },
                { signal: options?.signal },
            ),
        );

        return {
            summary: response.data.summary,
            filterContext: response.data.filterContext as IDashboardSummary["filterContext"],
            visualizationsIncluded: response.data.visualizationsIncluded.map((v) => ({
                visualizationId: v.visualizationId,
                title: v.title,
            })),
            visualizationsExcluded: response.data.visualizationsExcluded.map((v) => ({
                visualizationId: v.visualizationId,
                reason: v.reason,
                title: v.title,
            })),
            generatedAt: response.data.generatedAt,
        };
    }
}
