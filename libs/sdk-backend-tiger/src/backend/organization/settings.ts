// (C) 2022-2023 GoodData Corporation
import { IOrganizationSettingsService } from "@gooddata/sdk-backend-spi";
import { ISettings, IWhiteLabeling } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard, TigerSettingsType } from "../../types/index.js";
import { unwrapSettingContent } from "../../convertors/fromBackend/SettingsConverter.js";
import { TigerSettingsService, mapTypeToKey } from "../settings/index.js";

export class OrganizationSettingsService
    extends TigerSettingsService<ISettings>
    implements IOrganizationSettingsService
{
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {
        super();
    }

    public async setWhiteLabeling(whiteLabeling: IWhiteLabeling): Promise<void> {
        return this.setSetting("WHITE_LABELING", whiteLabeling);
    }

    public async setTimezone(timezone: string): Promise<void> {
        return this.setSetting("TIMEZONE", { value: timezone });
    }

    public async setDateFormat(dateFormat: string): Promise<void> {
        return this.setSetting("FORMAT_LOCALE", { value: dateFormat });
    }

    public async setWeekStart(weekStart: string): Promise<void> {
        return this.setSetting("WEEK_START", { value: weekStart });
    }

    public async setTheme(activeThemeId: string) {
        return this.setSetting("ACTIVE_THEME", { id: activeThemeId, type: "theme" });
    }

    public async deleteTheme() {
        return this.deleteSettingByType("ACTIVE_THEME");
    }

    public async setColorPalette(activeColorPaletteId: string) {
        return this.setSetting("ACTIVE_COLOR_PALETTE", { id: activeColorPaletteId, type: "colorPalette" });
    }

    public async deleteColorPalette() {
        return this.deleteSettingByType("ACTIVE_COLOR_PALETTE");
    }

    public async getSettings(): Promise<ISettings> {
        const { data } = await this.authCall(async (client) =>
            client.entities.getAllEntitiesOrganizationSettings({}),
        );

        return data.data.reduce((result: ISettings, setting) => {
            return {
                ...result,
                [mapTypeToKey(setting.attributes?.type, setting.id)]: unwrapSettingContent(
                    setting.attributes?.content,
                ),
            };
        }, {});
    }

    protected async getSettingByType(type: TigerSettingsType) {
        return this.authCall((client) =>
            client.entities.getAllEntitiesOrganizationSettings({
                filter: `type==${type}`,
            }),
        );
    }

    protected async updateSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall((client) =>
            client.entities.updateEntityOrganizationSettings({
                id,
                jsonApiOrganizationSettingInDocument: {
                    data: {
                        type: "organizationSetting",
                        id,
                        attributes: {
                            content,
                            type,
                        },
                    },
                },
            }),
        );
    }

    protected async createSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall((client) =>
            client.entities.createEntityOrganizationSettings({
                jsonApiOrganizationSettingInDocument: {
                    data: {
                        type: "organizationSetting",
                        id,
                        attributes: {
                            content,
                            type,
                        },
                    },
                },
            }),
        );
    }

    protected async deleteSettingByType(type: TigerSettingsType): Promise<void> {
        const settings = await this.getSettingByType(type);
        for (const setting of settings.data.data) {
            await this.authCall((client) =>
                client.entities.deleteEntityOrganizationSettings({ id: setting.id }),
            );
        }
    }
}
