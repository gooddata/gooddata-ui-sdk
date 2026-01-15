// (C) 2025-2026 GoodData Corporation

import type { ISemanticQualityService } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityIssuesCalculation, ISemanticQualityReport } from "@gooddata/sdk-model";

/**
 * Dummy semantic quality service.
 * @internal
 */
export class DummySemanticQualityService implements ISemanticQualityService {
    async getQualityReport(): Promise<ISemanticQualityReport> {
        return Promise.resolve({
            issues: [],
            updatedAt: undefined,
            status: "COMPLETED",
        });
    }
    async triggerQualityIssuesCalculation(): Promise<ISemanticQualityIssuesCalculation> {
        return Promise.resolve({
            status: "COMPLETED",
            processId: "",
        });
    }
}
