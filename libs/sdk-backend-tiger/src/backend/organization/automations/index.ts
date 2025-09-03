// (C) 2024-2025 GoodData Corporation

import {
    IGetOrganizationAutomationsQueryOptions,
    IOrganizationAutomationService,
    IOrganizationAutomationsQuery,
} from "@gooddata/sdk-backend-spi";

import { OrganizationAutomationsQuery } from "./automationsQuery.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

/**
 * Tiger implementation of organization automations service for centralized automation management.
 *
 * @alpha
 */
export class TigerOrganizationAutomationService implements IOrganizationAutomationService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public getAutomationsQuery(
        options?: IGetOrganizationAutomationsQueryOptions,
    ): IOrganizationAutomationsQuery {
        return new OrganizationAutomationsQuery(this.authCall, options);
    }

    public deleteAutomation(id: string, workspaceId: string): Promise<void> {
        return this.deleteAutomations([{ id, workspaceId }]);
    }

    public deleteAutomations(automations: Array<{ id: string; workspaceId: string }>): Promise<void> {
        return this.authCall(async (client) => {
            await client.actions.deleteOrganizationAutomations({
                organizationAutomationManagementBulkRequest: {
                    automations,
                },
            });
        });
    }

    public pauseAutomation(id: string, workspaceId: string): Promise<void> {
        return this.pauseAutomations([{ id, workspaceId }]);
    }

    public pauseAutomations(automations: Array<{ id: string; workspaceId: string }>): Promise<void> {
        return this.authCall(async (client) => {
            await client.actions.pauseOrganizationAutomations({
                organizationAutomationManagementBulkRequest: {
                    automations,
                },
            });
        });
    }

    public resumeAutomation(id: string, workspaceId: string): Promise<void> {
        return this.resumeAutomations([{ id, workspaceId }]);
    }

    public resumeAutomations(automations: Array<{ id: string; workspaceId: string }>): Promise<void> {
        return this.authCall(async (client) => {
            await client.actions.unpauseOrganizationAutomations({
                organizationAutomationManagementBulkRequest: {
                    automations,
                },
            });
        });
    }
}
