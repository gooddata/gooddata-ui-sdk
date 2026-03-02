// (C) 2025-2026 GoodData Corporation

import {
    type ActionsApiGenerateDescriptionRequest,
    ActionsApi_GenerateDescription,
} from "@gooddata/api-client-tiger/endpoints/actions";
import {
    GenAiApi_CreatedBy,
    GenAiApi_Tags,
    GenAiApi_TrendingObjects,
} from "@gooddata/api-client-tiger/endpoints/genAI";
import type {
    IAnalyticsCatalogCreatedBy,
    IAnalyticsCatalogGenerateDescriptionRequest,
    IAnalyticsCatalogGenerateDescriptionResponse,
    IAnalyticsCatalogService,
    IAnalyticsCatalogTags,
    IAnalyticsCatalogTrendingObjects,
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

    async generateDescription(
        request: IAnalyticsCatalogGenerateDescriptionRequest,
    ): Promise<IAnalyticsCatalogGenerateDescriptionResponse> {
        const response = await this.authCall((client) =>
            ActionsApi_GenerateDescription(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                generateDescriptionRequest: {
                    objectType: toGenerateDescriptionRequestObjectType(request.objectType),
                    objectId: request.objectId,
                },
            }),
        );

        return {
            description: response.data.description,
            note: response.data.note,
        };
    }

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

    async getTrendingObjects(): Promise<IAnalyticsCatalogTrendingObjects> {
        const response = await this.authCall((client) =>
            GenAiApi_TrendingObjects(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
            }),
        );
        return {
            objects: response.data.objects.map((item) => ({
                id: item.id,
                type: item.type,
                title: item.title,
                tags: item.tags,
                createdAt: item.createdAt,
                modifiedAt: item.modifiedAt,
                createdBy: item.createdBy,
                modifiedBy: item.modifiedBy,
                isHidden: item.isHidden,
                isHiddenFromKda: item.isHiddenFromKda,
                visualizationUrl: item.visualizationUrl,
            })),
        };
    }
}

function toGenerateDescriptionRequestObjectType(
    objectType: IAnalyticsCatalogGenerateDescriptionRequest["objectType"],
): ActionsApiGenerateDescriptionRequest["generateDescriptionRequest"]["objectType"] {
    switch (
        objectType //TODO: This should be fixed on the backend to prevent mismatch with other gen-ai endpoints.
    ) {
        case "insight":
            return "Visualization";
        case "analyticalDashboard":
            return "Dashboard";
        case "measure":
            return "Metric";
        case "fact":
            return "Fact";
        case "attribute":
            return "Attribute";
    }
}
