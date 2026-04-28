// (C) 2026 GoodData Corporation

import { type IKnowledgeDocumentsService } from "../../workspace/genAI/index.js";

/**
 * Service to query and manage organization-level generative-AI resources.
 *
 * @alpha
 */
export interface IOrganizationGenAIService {
    /**
     * Returns a service for listing and managing organization-level knowledge documents.
     */
    getKnowledgeDocuments(): IKnowledgeDocumentsService;
}
