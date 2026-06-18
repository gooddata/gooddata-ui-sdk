// (C) 2026 GoodData Corporation

import type {
    IKnowledgeDocumentsService,
    IMemoryItemsService,
    IOrganizationAIObservabilityService,
    IOrganizationGenAIService,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { OrganizationKnowledgeDocumentsService } from "./KnowledgeDocumentsService.js";
import { OrganizationMemoryItemsService } from "./MemoryItemsService.js";
import { OrganizationAIObservabilityService } from "./ObservabilityService.js";

/**
 * @internal
 */
export class TigerOrganizationGenAIService implements IOrganizationGenAIService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public getKnowledgeDocuments(): IKnowledgeDocumentsService {
        return new OrganizationKnowledgeDocumentsService(this.authCall);
    }

    public getMemoryItems(): IMemoryItemsService {
        return new OrganizationMemoryItemsService(this.authCall);
    }

    public getObservability(): IOrganizationAIObservabilityService {
        return new OrganizationAIObservabilityService(this.authCall);
    }
}
