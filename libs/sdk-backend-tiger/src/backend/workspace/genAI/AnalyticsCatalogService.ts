// (C) 2025 GoodData Corporation

import type { IAnalyticsCatalogService } from "@gooddata/sdk-backend-spi";

import type { TigerAuthenticatedCallGuard } from "../../../types/index.js";

/**
 * Analytics Catalog service.
 * @internal
 */
export class AnalyticsCatalogService implements IAnalyticsCatalogService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    /**
     * Returns available tags assigned to any object in the Analytics catalog.
     */
    async getTags(): Promise<{ tags: string[] }> {
        const response = await this.authCall((client) =>
            // Will be moved to client tiger APIs
            client.axios.get(`/api/v1/actions/workspaces/${this.workspaceId}/ai/analyticsCatalog/tags`),
        );
        return response.data;
    }
}
