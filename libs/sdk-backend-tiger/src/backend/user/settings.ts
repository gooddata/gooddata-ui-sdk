// (C) 2020-2023 GoodData Corporation
import { IUserSettingsService, IUserSettings } from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard, TigerSettingsType } from "../../types/index.js";
import { TigerFeaturesService } from "../features/index.js";
import { DefaultUserSettings } from "../uiSettings.js";
import { TigerSettingsService, mapTypeToKey } from "../settings/index.js";
import { unwrapSettingContent } from "../../convertors/fromBackend/SettingsConverter.js";

export class TigerUserSettingsService
    extends TigerSettingsService<IUserSettings>
    implements IUserSettingsService
{
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {
        super();
    }

    public async getSettings(): Promise<IUserSettings> {
        return this.authCall(async (client) => {
            const profile = await client.profile.getCurrent();
            const features = await new TigerFeaturesService(this.authCall).getFeatures(profile);
            const { data } = await client.actions.resolveAllSettingsWithoutWorkspace();
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

    protected async getSettingByType(type: TigerSettingsType) {
        return this.authCall(async (client) => {
            const profile = await client.profile.getCurrent();
            return client.entities.getAllEntitiesUserSettings({
                userId: profile.userId,
                filter: `type==${type}`,
            });
        });
    }

    protected async updateSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall(async (client) => {
            const profile = await client.profile.getCurrent();
            return client.entities.updateEntityUserSettings({
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

    protected async createSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall(async (client) => {
            const profile = await client.profile.getCurrent();
            return client.entities.createEntityUserSettings({
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

    protected async deleteSettingByType(type: TigerSettingsType): Promise<any> {
        const settings = await this.getSettingByType(type);
        for (const setting of settings.data.data) {
            await this.authCall(async (client) => {
                const profile = await client.profile.getCurrent();
                return client.entities.deleteEntityUserSettings({
                    userId: profile.userId,
                    id: setting.id,
                });
            });
        }
    }
}
