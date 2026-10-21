// (C) 2026 GoodData Corporation

import { ActionsUtilities, type JsonApiCustomApplicationSettingOut } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityCustomApplicationSettings,
    EntitiesApi_DeleteEntityCustomApplicationSettings,
    EntitiesApi_GetAllEntitiesCustomApplicationSettings,
    EntitiesApi_GetEntityCustomApplicationSettings,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IWorkspaceCustomApplicationSettingsService } from "@gooddata/sdk-backend-spi";
import { type ICustomApplicationSetting } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

function convertSetting({ id, attributes }: JsonApiCustomApplicationSettingOut): ICustomApplicationSetting {
    // The backend stores the content as a JSON object.
    const content = attributes.content as ICustomApplicationSetting["content"];
    return { id, applicationName: attributes.applicationName, content };
}

export class TigerWorkspaceCustomApplicationSettingsService implements IWorkspaceCustomApplicationSettingsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    public async getSettings(applicationName?: string): Promise<ICustomApplicationSetting[]> {
        const settings = await this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesCustomApplicationSettings(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    page,
                    size,
                }).then((response) => response.data.data.map(convertSetting)),
            ),
        );
        return applicationName
            ? settings.filter((setting) => setting.applicationName === applicationName)
            : settings;
    }

    public async getSetting(id: string): Promise<ICustomApplicationSetting> {
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityCustomApplicationSettings(
                client.axios,
                client.basePath,
                { workspaceId: this.workspace, objectId: id },
            );
            return convertSetting(response.data.data);
        });
    }

    public async createSetting(
        applicationName: string,
        content: object,
        id?: string,
    ): Promise<ICustomApplicationSetting> {
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityCustomApplicationSettings(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    jsonApiCustomApplicationSettingPostOptionalIdDocument: {
                        data: {
                            type: "customApplicationSetting",
                            id,
                            attributes: { applicationName, content },
                        },
                    },
                },
            );
            return convertSetting(response.data.data);
        });
    }

    public async deleteSetting(id: string): Promise<void> {
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityCustomApplicationSettings(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId: id,
            }),
        );
    }
}
