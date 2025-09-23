// (C) 2022-2025 GoodData Corporation

import { IOrganizationSettingsService } from "@gooddata/sdk-backend-spi";
import {
    type DashboardFiltersApplyMode,
    IAlertDefault,
    IOpenAiConfig,
    ISeparators,
    ISettings,
    IWhiteLabeling,
} from "@gooddata/sdk-model";

import { unwrapSettingContent } from "../../convertors/fromBackend/SettingsConverter.js";
import { TigerAuthenticatedCallGuard, TigerSettingsType } from "../../types/index.js";
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

    public override async setLocale(locale: string): Promise<void> {
        return this.setSetting("LOCALE", { value: locale });
    }

    public override async setMetadataLocale(locale: string): Promise<void> {
        return this.setSetting("METADATA_LOCALE", { value: locale });
    }

    public override async setFormatLocale(locale: string): Promise<void> {
        return this.setSetting("FORMAT_LOCALE", { value: locale });
    }

    public async setTimezone(timezone: string): Promise<void> {
        return this.setSetting("TIMEZONE", { value: timezone });
    }

    public override async setSeparators(separators: ISeparators): Promise<void> {
        return this.setSetting("SEPARATORS", separators);
    }

    public async setActiveLlmEndpoint(endpoint: string): Promise<void> {
        return this.setSetting("ACTIVE_LLM_ENDPOINT", { id: endpoint, type: "llmEndpoint" });
    }

    public async deleteActiveLlmEndpoint(): Promise<void> {
        return this.deleteSettingByType("ACTIVE_LLM_ENDPOINT");
    }

    public async setDateFormat(dateFormat: string): Promise<void> {
        return this.setSetting("FORMAT_LOCALE", { value: dateFormat });
    }

    public async setAttachmentSizeLimit(size: number): Promise<void> {
        return this.setSetting("ATTACHMENT_SIZE_LIMIT", { value: size });
    }

    public async setWeekStart(weekStart: string): Promise<void> {
        return this.setSetting("WEEK_START", { value: weekStart });
    }

    public override async setTheme(activeThemeId: string) {
        return this.setSetting("ACTIVE_THEME", { id: activeThemeId, type: "theme" });
    }

    public override async setAlertDefault(value: IAlertDefault): Promise<void> {
        return this.setSetting("ALERT", value);
    }

    public async deleteTheme() {
        return this.deleteSettingByType("ACTIVE_THEME");
    }

    public override async setColorPalette(activeColorPaletteId: string) {
        return this.setSetting("ACTIVE_COLOR_PALETTE", { id: activeColorPaletteId, type: "colorPalette" });
    }

    public async setOpenAiConfig(config: IOpenAiConfig) {
        return this.setSetting("OPENAI_CONFIG", config);
    }

    public async setDashboardFiltersApplyMode(dashboardFiltersApplyMode: DashboardFiltersApplyMode) {
        return this.setSetting("DASHBOARD_FILTERS_APPLY_MODE", dashboardFiltersApplyMode);
    }

    public async deleteColorPalette() {
        return this.deleteSettingByType("ACTIVE_COLOR_PALETTE");
    }

    public override async getSettings(): Promise<ISettings> {
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

    protected override async getSettingByType(type: TigerSettingsType) {
        return this.authCall((client) =>
            client.entities.getAllEntitiesOrganizationSettings({
                filter: `type==${type}`,
            }),
        );
    }

    protected override async updateSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
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

    protected override async createSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
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

    protected override async deleteSettingByType(type: TigerSettingsType): Promise<void> {
        const settings = await this.getSettingByType(type);
        for (const setting of settings.data.data) {
            await this.authCall((client) =>
                client.entities.deleteEntityOrganizationSettings({ id: setting.id }),
            );
        }
    }
}
