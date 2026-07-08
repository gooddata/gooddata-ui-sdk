// (C) 2022-2026 GoodData Corporation

import { ActionsApi_ResolveAllSettingsWithoutWorkspace } from "@gooddata/api-client-tiger/endpoints/actions";
import {
    EntitiesApi_CreateEntityOrganizationSettings,
    EntitiesApi_DeleteEntityOrganizationSettings,
    EntitiesApi_GetAllEntitiesOrganizationSettings,
    EntitiesApi_UpdateEntityOrganizationSettings,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IOrganizationSettingsService } from "@gooddata/sdk-backend-spi";
import {
    type DashboardFiltersApplyMode,
    type IActiveCalendars,
    type IAiRateLimit,
    type IAlertDefault,
    type IDefaultExportTemplate,
    type IFiscalYear,
    type IOpenAiConfig,
    type ISeparators,
    type ISettings,
    type IWhiteLabeling,
} from "@gooddata/sdk-model";

import { unwrapSettingContent } from "../../convertors/fromBackend/SettingsConverter.js";
import { type TigerAuthenticatedCallGuard, type TigerSettingsType } from "../../types/index.js";
import { mapTypeToKey } from "../settings/mapping.js";
import { TigerSettingsService } from "../settings/settings.js";

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

    public async setActiveLlmEndpoint(): Promise<void> {
        throw new Error("Deprecated endpoint");
    }

    public async deleteActiveLlmEndpoint(): Promise<void> {
        throw new Error("Deprecated endpoint");
    }

    public async setActiveLlmProvider(provider: string, defaultModelId: string): Promise<void> {
        return this.setSetting("ACTIVE_LLM_PROVIDER", { id: provider, type: "llmProvider", defaultModelId });
    }

    public async deleteActiveLlmProvider(): Promise<void> {
        return this.deleteSettingByType("ACTIVE_LLM_PROVIDER");
    }

    public async setDateFormat(dateFormat: string): Promise<void> {
        return this.setSetting("FORMAT_LOCALE", { value: dateFormat });
    }

    public async setAttachmentSizeLimit(size: number): Promise<void> {
        return this.setSetting("ATTACHMENT_SIZE_LIMIT", { value: size });
    }

    public async setExportCsvCustomDelimiter(delimiter: string): Promise<void> {
        return this.setSetting("EXPORT_CSV_CUSTOM_DELIMITER", { value: delimiter });
    }

    public async deleteExportCsvCustomDelimiter(): Promise<void> {
        return this.deleteSettingByType("EXPORT_CSV_CUSTOM_DELIMITER");
    }

    public async setMaxZoomLevel(level: number | null): Promise<void> {
        return this.setSetting("MAX_ZOOM_LEVEL", { value: level });
    }

    public async setWeekStart(weekStart: string): Promise<void> {
        return this.setSetting("WEEK_START", { value: weekStart });
    }

    public async setFiscalCalendar(fiscalYear: IFiscalYear): Promise<void> {
        return this.setSetting("FISCAL_YEAR", fiscalYear);
    }

    public async setActiveCalendars(calendars: IActiveCalendars): Promise<void> {
        return this.setSetting("ACTIVE_CALENDARS", calendars);
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

    public async setDefaultExportTemplate(value: IDefaultExportTemplate): Promise<void> {
        return this.setSetting("DEFAULT_EXPORT_TEMPLATE", value);
    }

    public async deleteDefaultExportTemplate(): Promise<void> {
        return this.deleteSettingByType("DEFAULT_EXPORT_TEMPLATE");
    }

    public async setEnableAiOnData(enabled: boolean): Promise<void> {
        return this.setSetting("ENABLE_AI_ON_DATA", { value: enabled });
    }

    public async setAiRateLimit(value: IAiRateLimit): Promise<void> {
        return this.setSetting("AI_RATE_LIMIT", value);
    }

    public async deleteAiRateLimit(): Promise<void> {
        return this.deleteSettingByType("AI_RATE_LIMIT");
    }

    public async getAiRateLimit(): Promise<IAiRateLimit | undefined> {
        const settings = await this.getSettingByType("AI_RATE_LIMIT");
        if (settings.data.data.length === 0) {
            return undefined;
        }
        const content = settings.data.data[0].attributes?.content;
        return unwrapSettingContent(content) as IAiRateLimit | undefined;
    }

    public async setEnableDrillToUrlByDefault(enabled: boolean): Promise<void> {
        return this.setSetting("ENABLE_DRILL_TO_URL_BY_DEFAULT", { value: enabled });
    }

    public async setEnablePartialDataResults(enabled: boolean): Promise<void> {
        return this.setSetting("ENABLE_PARTIAL_DATA_RESULTS", { value: enabled });
    }

    public async setGeoIconSheet(url: string): Promise<void> {
        return this.setSetting("GEO_ICON_SHEET", { value: url });
    }

    public async deleteGeoIconSheet(): Promise<void> {
        return this.deleteSettingByType("GEO_ICON_SHEET");
    }

    public async deleteColorPalette() {
        return this.deleteSettingByType("ACTIVE_COLOR_PALETTE");
    }

    public override async getSettings(): Promise<ISettings> {
        const { data } = await this.authCall(async (client) =>
            ActionsApi_ResolveAllSettingsWithoutWorkspace(client.axios, client.basePath, {
                excludeUserSettings: true,
            }),
        );

        return data.reduce((result: ISettings, setting) => {
            return {
                ...result,
                [mapTypeToKey(setting.type, setting.id)]: unwrapSettingContent(setting.content),
            };
        }, {});
    }

    protected override async getSettingByType(type: TigerSettingsType) {
        return this.authCall((client) =>
            EntitiesApi_GetAllEntitiesOrganizationSettings(client.axios, client.basePath, {
                filter: `type==${type}`,
            }),
        );
    }

    protected override async updateSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall((client) =>
            EntitiesApi_UpdateEntityOrganizationSettings(client.axios, client.basePath, {
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
            EntitiesApi_CreateEntityOrganizationSettings(client.axios, client.basePath, {
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
                EntitiesApi_DeleteEntityOrganizationSettings(client.axios, client.basePath, {
                    id: setting.id,
                }),
            );
        }
    }
}
