// (C) 2025 GoodData Corporation

import type { ISemanticQualityService } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityIssue } from "@gooddata/sdk-model";

/**
 * Dummy semantic quality service.
 * @internal
 */
export class DummySemanticQualityService implements ISemanticQualityService {
    async getQualityIssues(): Promise<ISemanticQualityIssue[]> {
        return [];
    }
}
