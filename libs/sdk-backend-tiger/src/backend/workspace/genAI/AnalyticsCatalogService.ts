// (C) 2025 GoodData Corporation

import { GenAiApi_CreatedBy, GenAiApi_Tags } from "@gooddata/api-client-tiger/genAI";
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
            GenAiApi_Tags(client.axios, client.basePath, { workspaceId: this.workspaceId }),
        );
        return response.data;
    }

    async getCreatedBy(): Promise<IAnalyticsCatalogCreatedBy> {
        const response = await this.authCall((client) =>
            GenAiApi_CreatedBy(client.axios, client.basePath, { workspaceId: this.workspaceId }),
        );
        return convertAnalyticsCatalogCreatedBy(response.data);
    }
}
