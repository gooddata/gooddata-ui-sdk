// (C) 2024-2025 GoodData Corporation

import type {
    IAnalyticsCatalogService,
    IChatThread,
    IGenAIService,
    IMemoryService,
    ISemanticSearchQuery,
} from "@gooddata/sdk-backend-spi";

import { AnalyticsCatalogService } from "./AnalyticsCatalogService.js";
import { ChatThreadService } from "./ChatThread.js";
import { MemoryService } from "./MemoryService.js";
import { SemanticSearchQuery } from "./SemanticSearchQuery.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class GenAIService implements IGenAIService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    getChatThread(): IChatThread {
        return new ChatThreadService(this.authCall, this.workspaceId);
    }

    getSemanticSearchQuery(): ISemanticSearchQuery {
        return new SemanticSearchQuery(this.authCall, this.workspaceId);
    }

    async semanticSearchIndex(): Promise<void> {
        await this.authCall((client) =>
            client.actions.metadataSync({
                workspaceId: this.workspaceId,
            }),
        );
    }

    getMemory(): IMemoryService {
        return new MemoryService(this.authCall, this.workspaceId);
    }

    getAnalyticsCatalog(): IAnalyticsCatalogService {
        return new AnalyticsCatalogService(this.authCall, this.workspaceId);
    }
}
