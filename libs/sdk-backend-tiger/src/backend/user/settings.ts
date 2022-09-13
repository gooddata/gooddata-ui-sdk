// (C) 2020-2022 GoodData Corporation
import { IUserSettingsService, IUserSettings, isUnexpectedError } from "@gooddata/sdk-backend-spi";
import { convertApiError } from "../../utils/errorHandling";
import { TigerAuthenticatedCallGuard } from "../../types";
import { TigerFeaturesService } from "../features";
import { DefaultUserSettings } from "../uiSettings";
import { ISettings } from "@gooddata/sdk-model";
import { unwrapSettingContent } from "../../convertors/fromBackend/SettingsConverter";

export class TigerUserSettingsService implements IUserSettingsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

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

    public async setLocale(locale: string): Promise<void> {
        return this.setSetting("locale", { value: locale });
    }

    private async setSetting(id: string, content: any): Promise<void> {
        // Currently it is necessary to check existence of required setting
        // since PUT does not support creation of non-existing setting.
        // It can be simplified to Update method once NAS-4291 is implemented
        try {
            await this.getSetting(id);
            await this.updateSetting(id, content);
        } catch (error: any) {
            if (isUnexpectedError(error)) {
                // if such settings is not defined
                await this.createSetting(id, content);
                return;
            }
            throw convertApiError(error);
        }
    }

    private async getSetting(id: string): Promise<any> {
        return this.authCall(async (client) => {
            const profile = await client.profile.getCurrent();
            return client.entities.getEntityUserSettings({
                userId: profile.userId,
                id,
            });
        });
    }

    private async updateSetting(id: string, content: any): Promise<any> {
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
                        },
                    },
                },
            });
        });
    }

    private async createSetting(id: string, content: any): Promise<any> {
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
                        },
                    },
                },
            });
        });
    }
}
