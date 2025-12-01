// (C) 2024-2025 GoodData Corporation

import { ITigerClientBase } from "@gooddata/api-client-tiger";
import { ActionsApi_MetadataSync, ActionsApi_ResolveLlmEndpoints } from "@gooddata/api-client-tiger/actions";
import type {
    IAnalyticsCatalogService,
    IChatThread,
    IGenAIService,
    IMemoryItemsService,
    ISemanticQualityService,
    ISemanticSearchQuery,
} from "@gooddata/sdk-backend-spi";
import { ILlmEndpointBase } from "@gooddata/sdk-model";

import { AnalyticsCatalogService } from "./AnalyticsCatalogService.js";
import { ChatThreadService } from "./ChatThread.js";
import { MemoryItemsService } from "./MemoryItemsService.js";
import { SemanticQualityService } from "./SemanticQualityService.js";
import { SemanticSearchQuery } from "./SemanticSearchQuery.js";
import { DateNormalizer } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { convertResolvedLlmEndpoint } from "../../../convertors/fromBackend/llmEndpointConvertor.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class GenAIService implements IGenAIService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
        private readonly dateNormalizer: DateNormalizer,
    ) {}

    getChatThread(): IChatThread {
        return new ChatThreadService(this.authCall, this.workspaceId, this.dateNormalizer);
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

    async getLlmEndpoints(): Promise<ILlmEndpointBase[]> {
        return await this.authCall(async (client: ITigerClientBase) => {
            const result = await ActionsApi_ResolveLlmEndpoints(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
            });
            const endpoints = result.data?.data;
            return convertResolvedLlmEndpoint(endpoints ?? []);
        });
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
