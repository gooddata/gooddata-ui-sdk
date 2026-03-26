// (C) 2024-2026 GoodData Corporation

import {
    ActionsApi_MetadataSync,
    ActionsApi_ResolveLlmProviders,
} from "@gooddata/api-client-tiger/endpoints/actions";
import type {
    IAnalyticsCatalogService,
    IChatConversations,
    IChatThread,
    IGenAIService,
    IKnowledgeDocumentsService,
    IMemoryItemsService,
    ISemanticQualityService,
    ISemanticSearchQuery,
} from "@gooddata/sdk-backend-spi";

import { AnalyticsCatalogService } from "./AnalyticsCatalogService.js";
import { ChatConversationsService } from "./ChatConversations.js";
import { ChatThreadService } from "./ChatThread.js";
import { KnowledgeDocumentsService } from "./KnowledgeDocumentsService.js";
import { MemoryItemsService } from "./MemoryItemsService.js";
import { SemanticQualityService } from "./SemanticQualityService.js";
import { SemanticSearchQuery } from "./SemanticSearchQuery.js";
import { type DateNormalizer } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class GenAIService implements IGenAIService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
        private readonly dateNormalizer: DateNormalizer,
    ) {}

    getChatThread(): IChatThread {
        return new ChatThreadService(this.authCall, this.workspaceId, this.dateNormalizer);
    }

    getChatConversations(): IChatConversations {
        return new ChatConversationsService(this.authCall, this.workspaceId, this.dateNormalizer);
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
}
