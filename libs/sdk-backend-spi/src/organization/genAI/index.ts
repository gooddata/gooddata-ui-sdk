// (C) 2026 GoodData Corporation

import { type IKnowledgeDocumentsService } from "../../workspace/genAI/index.js";

/**
 * AI observability metric type.
 *
 * @alpha
 */
export type IOrganizationAIObservabilityMetricType = "AI_WORKSPACES" | "AI_USERS" | "AI_QUERIES";

/**
 * AI observability metric for the caller's organization.
 *
 * @alpha
 */
export interface IOrganizationAIObservabilityMetric {
    /**
     * Metric type.
     */
    type: IOrganizationAIObservabilityMetricType;

    /**
     * Metric value for the current calendar month.
     */
    currentValue: number;

    /**
     * Metric value for the previous calendar month.
     */
    previousValue: number;
}

/**
 * AI observability overview for the caller's organization.
 *
 * @alpha
 */
export interface IOrganizationAIObservabilityOverview {
    metrics: IOrganizationAIObservabilityMetric[];
}

/**
 * Service for querying AI observability metrics.
 *
 * @alpha
 */
export interface IOrganizationAIObservabilityService {
    /**
     * Returns AI observability overview for the caller's organization.
     */
    getOverview(): Promise<IOrganizationAIObservabilityOverview>;
}

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

    /**
     * Returns a service for querying organization-level AI observability metrics.
     */
    getObservability(): IOrganizationAIObservabilityService;
}
