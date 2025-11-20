// (C) 2023-2025 GoodData Corporation

import { ITigerClientBase } from "@gooddata/api-client-tiger";
import {
    ActionsApi_DeleteWorkspaceAutomations,
    ActionsApi_PauseWorkspaceAutomations,
    ActionsApi_UnpauseWorkspaceAutomations,
    ActionsApi_UnsubscribeAutomation,
    ActionsApi_UnsubscribeSelectedWorkspaceAutomations,
} from "@gooddata/api-client-tiger/actions";
import {
    EntitiesApi_CreateEntityAutomations,
    EntitiesApi_DeleteEntityAutomations,
    EntitiesApi_GetAllEntitiesAutomations,
    EntitiesApi_GetEntityAutomations,
    EntitiesApi_UpdateEntityAutomations,
} from "@gooddata/api-client-tiger/entitiesObjects";
import {
    IAutomationsQuery,
    IGetAutomationOptions,
    IGetAutomationsOptions,
    IGetAutomationsQueryOptions,
    IRawExportCustomOverrides,
    IWorkspaceAutomationService,
} from "@gooddata/sdk-backend-spi";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IExecutionDefinition,
} from "@gooddata/sdk-model";

import { AutomationsQuery } from "./automationsQuery.js";
import { convertAutomation as convertAutomationFromBackend } from "../../../convertors/fromBackend/AutomationConverter.js";
import { convertAutomation as convertAutomationToBackend } from "../../../convertors/toBackend/AutomationConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { getSettingsForCurrentUser } from "../settings/index.js";

export class TigerWorkspaceAutomationService implements IWorkspaceAutomationService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    public getAutomations = async (options: IGetAutomationsOptions): Promise<IAutomationMetadataObject[]> => {
        const { loadUserData = false } = options ?? {};
        const enableAutomationFilterContext = await this.getEnableAutomationFilterContext();
        const enableNewScheduledExport = await this.getEnableNewScheduledExport();

        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetAllEntitiesAutomations(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                include: [
                    "notificationChannel",
                    "recipients",
                    "exportDefinitions",
                    "analyticalDashboard",
                    ...(loadUserData ? (["createdBy", "modifiedBy"] as const) : []),
                ],
                origin: "NATIVE", // ensures that no inherited automations are returned
            });

            const automations = result.data?.data || [];
            return automations.map((automation) =>
                convertAutomationFromBackend(
                    automation,
                    result.data.included ?? [],
                    enableAutomationFilterContext,
                    enableNewScheduledExport,
                ),
            );
        });
    };

    public getAutomationsQuery = (options?: IGetAutomationsQueryOptions): IAutomationsQuery => {
        return new AutomationsQuery(this.authCall, { workspaceId: this.workspaceId }, options);
    };

    public getAutomation = async (
        id: string,
        options?: IGetAutomationOptions,
    ): Promise<IAutomationMetadataObject> => {
        const { loadUserData = false } = options ?? {};
        const enableAutomationFilterContext = await this.getEnableAutomationFilterContext();
        const enableNewScheduledExport = await this.getEnableNewScheduledExport();

        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetEntityAutomations(client.axios, client.basePath, {
                objectId: id,
                workspaceId: this.workspaceId,
                include: [
                    "notificationChannel",
                    "recipients",
                    "exportDefinitions",
                    "analyticalDashboard",
                    ...(loadUserData ? (["createdBy", "modifiedBy"] as const) : []),
                ],
            });
            return convertAutomationFromBackend(
                result.data.data,
                result.data.included ?? [],
                enableAutomationFilterContext,
                enableNewScheduledExport,
            );
        });
    };

    public createAutomation = async (
        automation: IAutomationMetadataObjectDefinition,
        options?: IGetAutomationOptions,
        widgetExecution?: IExecutionDefinition,
        overrides?: IRawExportCustomOverrides,
    ): Promise<IAutomationMetadataObject> => {
        const { loadUserData = false } = options ?? {};
        const enableAutomationFilterContext = await this.getEnableAutomationFilterContext();
        const enableNewScheduledExport = await this.getEnableNewScheduledExport();

        return this.authCall(async (client: ITigerClientBase) => {
            const convertedAutomation = convertAutomationToBackend(
                automation,
                enableAutomationFilterContext,
                enableNewScheduledExport,
                widgetExecution,
                overrides,
            );
            const result = await EntitiesApi_CreateEntityAutomations(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                jsonApiAutomationInDocument: {
                    data: convertedAutomation,
                },
                include: [
                    "notificationChannel",
                    "recipients",
                    "exportDefinitions",
                    "analyticalDashboard",
                    ...(loadUserData ? (["createdBy", "modifiedBy"] as const) : []),
                ],
            });

            return convertAutomationFromBackend(
                result.data.data,
                result.data.included ?? [],
                enableAutomationFilterContext,
                enableNewScheduledExport,
            );
        });
    };

    public updateAutomation = async (
        automation: IAutomationMetadataObject,
        options?: IGetAutomationOptions,
        widgetExecution?: IExecutionDefinition,
        overrides?: IRawExportCustomOverrides,
    ): Promise<IAutomationMetadataObject> => {
        const { loadUserData = false } = options ?? {};
        const enableAutomationFilterContext = await this.getEnableAutomationFilterContext();
        const enableNewScheduledExport = await this.getEnableNewScheduledExport();

        return this.authCall(async (client: ITigerClientBase) => {
            const convertedAutomation = convertAutomationToBackend(
                automation,
                enableAutomationFilterContext,
                enableNewScheduledExport,
                widgetExecution,
                overrides,
            );
            const result = await EntitiesApi_UpdateEntityAutomations(client.axios, client.basePath, {
                objectId: automation.id,
                workspaceId: this.workspaceId,
                jsonApiAutomationInDocument: {
                    data: convertedAutomation,
                },
                include: [
                    "notificationChannel",
                    "recipients",
                    "exportDefinitions",
                    "analyticalDashboard",
                    ...(loadUserData ? (["createdBy", "modifiedBy"] as const) : []),
                ],
            });
            return convertAutomationFromBackend(
                result.data.data,
                result.data.included ?? [],
                enableAutomationFilterContext,
                enableNewScheduledExport,
            );
        });
    };

    public deleteAutomation(id: string): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await EntitiesApi_DeleteEntityAutomations(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                objectId: id,
            });
        });
    }

    public unsubscribeAutomation(id: string): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await ActionsApi_UnsubscribeAutomation(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                automationId: id,
            });
        });
    }

    public deleteAutomations(ids: string[]): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await ActionsApi_DeleteWorkspaceAutomations(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                workspaceAutomationManagementBulkRequest: {
                    automations: ids.map((id) => ({ id })),
                },
            });
        });
    }

    public unsubscribeAutomations(ids: string[]): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await ActionsApi_UnsubscribeSelectedWorkspaceAutomations(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                workspaceAutomationManagementBulkRequest: {
                    automations: ids.map((id) => ({ id })),
                },
            });
        });
    }

    public pauseAutomation(id: string): Promise<void> {
        return this.pauseAutomations([id]);
    }

    pauseAutomations(ids: string[]): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await ActionsApi_PauseWorkspaceAutomations(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                workspaceAutomationManagementBulkRequest: {
                    automations: ids.map((id) => ({ id })),
                },
            });
        });
    }

    public resumeAutomation(id: string): Promise<void> {
        return this.resumeAutomations([id]);
    }

    resumeAutomations(ids: string[]): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await ActionsApi_UnpauseWorkspaceAutomations(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                workspaceAutomationManagementBulkRequest: {
                    automations: ids.map((id) => ({ id })),
                },
            });
        });
    }

    private getEnableAutomationFilterContext = async (): Promise<boolean> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspaceId);
        return userSettings.enableAutomationFilterContext ?? true;
    };

    private getEnableNewScheduledExport = async (): Promise<boolean> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspaceId);
        return userSettings.enableNewScheduledExport ?? false;
    };
}
