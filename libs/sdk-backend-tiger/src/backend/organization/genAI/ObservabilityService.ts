// (C) 2026 GoodData Corporation

import { GenAiApi_GetObservabilityOverview } from "@gooddata/api-client-tiger/endpoints/genAI";
import type {
    IOrganizationAIObservabilityOverview,
    IOrganizationAIObservabilityService,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

/**
 * Organization-level AI observability service.
 *
 * @internal
 */
export class OrganizationAIObservabilityService implements IOrganizationAIObservabilityService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    async getOverview(): Promise<IOrganizationAIObservabilityOverview> {
        const response = await this.authCall((client) =>
            GenAiApi_GetObservabilityOverview(client.axios, client.basePath),
        );

        return response.data;
    }
}
