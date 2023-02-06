// (C) 2020-2023 GoodData Corporation
import { IUserSettingsService, IUserSettings } from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard, TigerSettingsType } from "../../types";
import { TigerFeaturesService } from "../features";
import { DefaultUserSettings } from "../uiSettings";
import { TigerSettingsService } from "../settings";
import { unwrapSettingContent } from "../../convertors/fromBackend/SettingsConverter";

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
                    [setting.id]: unwrapSettingContent(setting.content),
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
}
