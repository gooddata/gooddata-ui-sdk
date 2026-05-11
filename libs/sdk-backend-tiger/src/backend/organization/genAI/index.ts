// (C) 2026 GoodData Corporation

import type { IKnowledgeDocumentsService, IOrganizationGenAIService } from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { OrganizationKnowledgeDocumentsService } from "./KnowledgeDocumentsService.js";

/**
 * @internal
 */
export class TigerOrganizationGenAIService implements IOrganizationGenAIService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public getKnowledgeDocuments(): IKnowledgeDocumentsService {
        return new OrganizationKnowledgeDocumentsService(this.authCall);
    }
}
