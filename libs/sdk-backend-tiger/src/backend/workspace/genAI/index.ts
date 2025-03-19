// (C) 2024 GoodData Corporation

import { IChatThread, IGenAIService, ISemanticSearchQuery } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { SemanticSearchQuery } from "./SemanticSearchQuery.js";
import { ChatThreadService } from "./ChatThread.js";

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
