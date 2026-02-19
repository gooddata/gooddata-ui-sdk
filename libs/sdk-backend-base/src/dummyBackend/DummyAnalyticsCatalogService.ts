// (C) 2025-2026 GoodData Corporation

import type {
    IAnalyticsCatalogCreatedBy,
    IAnalyticsCatalogGenerateDescriptionRequest,
    IAnalyticsCatalogGenerateDescriptionResponse,
    IAnalyticsCatalogService,
    IAnalyticsCatalogTags,
} from "@gooddata/sdk-backend-spi";

/**
 * Dummy Analytics catalog service.
 * @internal
 */
export class DummyAnalyticsCatalogService implements IAnalyticsCatalogService {
    async generateDescription(
        _request: IAnalyticsCatalogGenerateDescriptionRequest,
    ): Promise<IAnalyticsCatalogGenerateDescriptionResponse> {
        return Promise.resolve({
            description: "",
            note: "",
        });
    }

    async getTags(): Promise<IAnalyticsCatalogTags> {
        return Promise.resolve({ tags: ["Test"] });
    }

    async getCreatedBy(): Promise<IAnalyticsCatalogCreatedBy> {
        return Promise.resolve({
            reasoning: "",
            users: [],
        });
    }
}
