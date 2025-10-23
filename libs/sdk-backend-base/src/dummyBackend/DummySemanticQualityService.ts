// (C) 2025 GoodData Corporation

import type { ISemanticQualityService } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityIssuesCalculation, ISemanticQualityReport } from "@gooddata/sdk-model";

/**
 * Dummy semantic quality service.
 * @internal
 */
export class DummySemanticQualityService implements ISemanticQualityService {
    async getQualityReport(): Promise<ISemanticQualityReport> {
        return {
            issues: [],
            updatedAt: undefined,
        };
    }
    async triggerQualityIssuesCalculation(): Promise<ISemanticQualityIssuesCalculation> {
        return {
            status: "COMPLETED",
            processId: "",
        };
    }
}
