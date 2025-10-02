// (C) 2025 GoodData Corporation

import type {
    IAnalyticsCatalogCreatedBy,
    IAnalyticsCatalogService,
    IAnalyticsCatalogTags,
} from "@gooddata/sdk-backend-spi";

import { convertAnalyticsCatalogCreatedBy } from "../../../convertors/fromBackend/AnalyticsCatalogConverter.js";
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
    async getTags(): Promise<IAnalyticsCatalogTags> {
        const response = await this.authCall((client) =>
            client.genAI.tags({ workspaceId: this.workspaceId }),
        );
        return response.data;
    }

    async getCreatedBy(): Promise<IAnalyticsCatalogCreatedBy> {
        const response = await this.authCall((client) =>
            client.genAI.createdBy({ workspaceId: this.workspaceId }),
        );
        return convertAnalyticsCatalogCreatedBy(response.data);
    }
}
