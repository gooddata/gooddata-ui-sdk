// (C) 2025 GoodData Corporation

import type { IAnalyticsCatalogService } from "@gooddata/sdk-backend-spi";

/**
 * Dummy Analytics catalog service.
 * @internal
 */
export class DummyAnalyticsCatalogService implements IAnalyticsCatalogService {
    async getTags() {
        return { tags: ["Test"] };
    }
}
