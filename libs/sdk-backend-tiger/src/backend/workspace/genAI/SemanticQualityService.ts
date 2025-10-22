// (C) 2025 GoodData Corporation

import type { ISemanticQualityService } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityIssue, ISemanticQualityIssuesCalculation } from "@gooddata/sdk-model";

import {
    convertQualityIssuesCalculationResponse,
    convertQualityIssuesResponse,
} from "../../../convertors/fromBackend/SemanticQualityConverter.js";
import type { TigerAuthenticatedCallGuard } from "../../../types/index.js";

/**
 * Semantic quality service implementation.
 * @internal
 */
export class SemanticQualityService implements ISemanticQualityService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    /**
     * Returns a list of quality issues detected in the workspace metadata.
     *
     * Issues are sorted by severity (ERROR, WARNING, INFO).
     */
    async getQualityIssues(): Promise<ISemanticQualityIssue[]> {
        const response = await this.authCall((client) => {
            return client.genAI.getQualityIssues({ workspaceId: this.workspaceId });
        });

        return convertQualityIssuesResponse(response.data);
    }

    async triggerQualityIssuesCalculation(): Promise<ISemanticQualityIssuesCalculation> {
        const response = await this.authCall((client) => {
            return client.genAI.triggerQualityIssuesCalculation({ workspaceId: this.workspaceId });
        });

        return convertQualityIssuesCalculationResponse(response.data);
    }
}
