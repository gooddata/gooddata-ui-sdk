// (C) 2026 GoodData Corporation

import type {
    IKnowledgeDocumentsService,
    IOrganizationAIObservabilityService,
    IOrganizationGenAIService,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { OrganizationKnowledgeDocumentsService } from "./KnowledgeDocumentsService.js";
import { OrganizationAIObservabilityService } from "./ObservabilityService.js";

/**
 * @internal
 */
export class TigerOrganizationGenAIService implements IOrganizationGenAIService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public getKnowledgeDocuments(): IKnowledgeDocumentsService {
        return new OrganizationKnowledgeDocumentsService(this.authCall);
    }

    public getObservability(): IOrganizationAIObservabilityService {
        return new OrganizationAIObservabilityService(this.authCall);
    }
}
