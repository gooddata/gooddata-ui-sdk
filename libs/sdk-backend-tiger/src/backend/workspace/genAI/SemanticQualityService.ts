// (C) 2025 GoodData Corporation

import type { ISemanticQualityService } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityIssuesCalculation, ISemanticQualityReport } from "@gooddata/sdk-model";

import {
    convertQualityIssuesCalculationResponse,
    convertQualityReportResponse,
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
    async getQualityReport(options?: { signal?: AbortSignal }): Promise<ISemanticQualityReport> {
        const response = await this.authCall((client) => {
            return client.genAI.getQualityIssues(
                { workspaceId: this.workspaceId },
                { signal: options?.signal },
            );
        });

        return convertQualityReportResponse(response.data);
    }

    async triggerQualityIssuesCalculation(): Promise<ISemanticQualityIssuesCalculation> {
        const response = await this.authCall((client) => {
            return client.genAI.triggerQualityIssuesCalculation({ workspaceId: this.workspaceId });
        });

        return convertQualityIssuesCalculationResponse(response.data);
    }
}
