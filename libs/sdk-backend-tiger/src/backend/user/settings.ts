// (C) 2020-2025 GoodData Corporation
import { ActionsApi_ResolveAllSettingsWithoutWorkspace } from "@gooddata/api-client-tiger/actions";
import {
    EntitiesApi_CreateEntityUserSettings,
    EntitiesApi_DeleteEntityUserSettings,
    EntitiesApi_GetAllEntitiesUserSettings,
    EntitiesApi_UpdateEntityUserSettings,
} from "@gooddata/api-client-tiger/entitiesObjects";
import { ProfileApi_GetCurrent } from "@gooddata/api-client-tiger/profile";
import { IUserSettings, IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";

import { unwrapSettingContent } from "../../convertors/fromBackend/SettingsConverter.js";
import { TigerAuthenticatedCallGuard, TigerSettingsType } from "../../types/index.js";
import { TigerFeaturesService, pickContext } from "../features/index.js";
import { TigerSettingsService, mapTypeToKey } from "../settings/index.js";
import { DefaultUserSettings } from "../uiSettings.js";

export class TigerUserSettingsService
    extends TigerSettingsService<IUserSettings>
    implements IUserSettingsService
{
    private tigerFeatureService: TigerFeaturesService;
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {
        super();
        this.tigerFeatureService = new TigerFeaturesService(this.authCall);
    }

    public override async getSettings(): Promise<IUserSettings> {
        return this.authCall(async (client) => {
            const profile = await ProfileApi_GetCurrent(client.axios);
            const context = pickContext(undefined, profile.organizationId, profile.entitlements);
            const features = await this.tigerFeatureService.getFeatures(profile, context);
            const { data } = await ActionsApi_ResolveAllSettingsWithoutWorkspace(
                client.axios,
                client.basePath,
            );
            const resolvedSettings = data.reduce(
                (result: ISettings, setting) => ({
                    ...result,
                    [mapTypeToKey(setting.type, setting.id)]: unwrapSettingContent(setting.content),
                }),
                {},
            );

            return {
                ...DefaultUserSettings,
                ...features,
                ...resolvedSettings,
                userId: profile.userId,
            };
        });
    }

    protected override async getSettingByType(type: TigerSettingsType) {
        return this.authCall(async (client) => {
            const profile = await ProfileApi_GetCurrent(client.axios);
            return EntitiesApi_GetAllEntitiesUserSettings(client.axios, client.basePath, {
                userId: profile.userId,
                filter: `type==${type}`,
            });
        });
    }

    protected override async updateSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall(async (client) => {
            const profile = await ProfileApi_GetCurrent(client.axios);
            return EntitiesApi_UpdateEntityUserSettings(client.axios, client.basePath, {
                id,
                userId: profile.userId,
                jsonApiUserSettingInDocument: {
                    data: {
                        type: "userSetting",
                        id,
                        attributes: {
                            content,
                            type,
                        },
                    },
                },
            });
        });
    }

    protected override async createSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall(async (client) => {
            const profile = await ProfileApi_GetCurrent(client.axios);
            return EntitiesApi_CreateEntityUserSettings(client.axios, client.basePath, {
                userId: profile.userId,
                jsonApiUserSettingInDocument: {
                    data: {
                        type: "userSetting",
                        id,
                        attributes: {
                            content,
                            type,
                        },
                    },
                },
            });
        });
    }

    protected override async deleteSettingByType(type: TigerSettingsType): Promise<any> {
        const settings = await this.getSettingByType(type);
        for (const setting of settings.data.data) {
            await this.authCall(async (client) => {
                const profile = await ProfileApi_GetCurrent(client.axios);
                return EntitiesApi_DeleteEntityUserSettings(client.axios, client.basePath, {
                    userId: profile.userId,
                    id: setting.id,
                });
            });
        }
    }
}
