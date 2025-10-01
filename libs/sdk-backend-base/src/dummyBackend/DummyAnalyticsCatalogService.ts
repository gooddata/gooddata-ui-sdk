// (C) 2025 GoodData Corporation

import type {
    IAnalyticsCatalogCreatedBy,
    IAnalyticsCatalogService,
    IAnalyticsCatalogTags,
} from "@gooddata/sdk-backend-spi";

/**
 * Dummy Analytics catalog service.
 * @internal
 */
export class DummyAnalyticsCatalogService implements IAnalyticsCatalogService {
    async getTags(): Promise<IAnalyticsCatalogTags> {
        return { tags: ["Test"] };
    }

    async getCreatedBy(): Promise<IAnalyticsCatalogCreatedBy> {
        return {
            reasoning: "",
            users: [],
        };
    }
}
