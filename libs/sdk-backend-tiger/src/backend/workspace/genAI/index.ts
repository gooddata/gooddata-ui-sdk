// (C) 2024-2025 GoodData Corporation

import { IChatThread, IGenAIService, ISemanticSearchQuery } from "@gooddata/sdk-backend-spi";

import { ChatThreadService } from "./ChatThread.js";
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
}
