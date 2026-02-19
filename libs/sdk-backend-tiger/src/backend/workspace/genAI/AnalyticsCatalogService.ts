// (C) 2025-2026 GoodData Corporation

import {
    type ActionsApiGenerateDescriptionRequest,
    ActionsApi_GenerateDescription,
} from "@gooddata/api-client-tiger/endpoints/actions";
import { GenAiApi_CreatedBy, GenAiApi_Tags } from "@gooddata/api-client-tiger/endpoints/genAI";
import type {
    IAnalyticsCatalogCreatedBy,
    IAnalyticsCatalogGenerateDescriptionRequest,
    IAnalyticsCatalogGenerateDescriptionResponse,
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
