// (C) 2019-2025 GoodData Corporation
import {
    FeatureContext,
    JsonApiAnalyticalDashboardOutMetaOriginOriginTypeEnum,
    JsonApiWorkspaceSettingOutWithLinks,
    isLiveFeatures,
    isStaticFeatures,
} from "@gooddata/api-client-tiger";
import {
    IUserWorkspaceSettings,
    IWorkspaceSettings,
    IWorkspaceSettingsService,
} from "@gooddata/sdk-backend-spi";
import { type DashboardFiltersApplyMode, IAlertDefault, ISeparators, ISettings } from "@gooddata/sdk-model";

import { LIB_VERSION } from "../../../__version.js";
import {
    IWrappedDateFilterConfig,
    convertDateFilterConfig,
} from "../../../convertors/fromBackend/DateFilterConfigurationConverter.js";
import { unwrapSettingContent } from "../../../convertors/fromBackend/SettingsConverter.js";
import { TigerAuthenticatedCallGuard, TigerSettingsType } from "../../../types/index.js";
import {
    TigerFeaturesService,
    getControlledFeatureRollout,
    getOrganizationTier,
} from "../../features/index.js";
import { TigerSettingsService, mapTypeToKey } from "../../settings/index.js";
import { DefaultUiSettings, DefaultUserSettings } from "../../uiSettings.js";
import { GET_OPTIMIZED_WORKSPACE_PARAMS } from "../constants.js";

export class TigerWorkspaceSettings
    extends TigerSettingsService<IWorkspaceSettings>
    implements IWorkspaceSettingsService
{
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {
        super();
    }

    public getSettings(): Promise<IWorkspaceSettings> {
        return this.authCall(async (client) => {
            const { data } = await this.authCall(async (client) =>
                client.entities.getAllEntitiesWorkspaceSettings({ workspaceId: this.workspace }),
            );
            const settings = this.mapSettingsToKeys(data.data);

            const {
                data: { meta: config },
            } = (
                await client.entities.getEntityWorkspaces({
                    id: this.workspace,
                    ...GET_OPTIMIZED_WORKSPACE_PARAMS,
                })
            ).data;

            return {
                workspace: this.workspace,
                ...DefaultUiSettings,
                ...config?.config,
                ...settings,
            };
        });
    }

    private mapSettingsToKeys = (data: JsonApiWorkspaceSettingOutWithLinks[]): ISettings => {
        const nativeSettings = this.mapSettingsToKeysByOrigin(
            data,
            JsonApiAnalyticalDashboardOutMetaOriginOriginTypeEnum.NATIVE,
        );
        const parentSettings = this.mapSettingsToKeysByOrigin(
            data,
            JsonApiAnalyticalDashboardOutMetaOriginOriginTypeEnum.PARENT,
        );
        return Object.keys(parentSettings).reduce((result: ISettings, key) => {
            if (result[key] === undefined) {
                return {
                    ...result,
                    [key]: parentSettings[key],
                };
            }
            return result;
        }, nativeSettings);
    };

    private mapSettingsToKeysByOrigin = (
        data: JsonApiWorkspaceSettingOutWithLinks[],
        origin: JsonApiAnalyticalDashboardOutMetaOriginOriginTypeEnum,
    ): ISettings => {
        return data.reduce((result: ISettings, setting) => {
            const isValueApplicable = setting.meta?.origin?.originType === origin;
            if (!isValueApplicable) {
                return result;
            }
            const key = mapTypeToKey(setting.attributes?.type, setting.id);
            const value = unwrapSettingContent(setting.attributes?.content);
            return {
                ...result,
                [key]: value,
            };
        }, {});
    };

    public async setAlertDefault(value: IAlertDefault): Promise<void> {
        return this.setSetting("ALERT", value);
    }

    public async setLocale(locale: string): Promise<void> {
        return this.setSetting("LOCALE", { value: locale });
    }

    public async setMetadataLocale(locale: string): Promise<void> {
        return this.setSetting("METADATA_LOCALE", { value: locale });
    }

    public async setSeparators(separators: ISeparators): Promise<void> {
        return this.setSetting("SEPARATORS", separators);
    }

    public async setActiveLlmEndpoint(endpoint: string): Promise<void> {
        return this.setSetting("ACTIVE_LLM_ENDPOINT", { id: endpoint, type: "llmEndpoint" });
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

    public async setDashboardFiltersApplyMode(
        dashboardFiltersApplyMode: DashboardFiltersApplyMode,
    ): Promise<void> {
        return this.setSetting("DASHBOARD_FILTERS_APPLY_MODE", dashboardFiltersApplyMode);
    }

    public async deleteDashboardFiltersApplyMode(): Promise<void> {
        return this.deleteSettingByType("DASHBOARD_FILTERS_APPLY_MODE");
    }

    public async setTheme(activeThemeId: string): Promise<void> {
        return this.setSetting("ACTIVE_THEME", { id: activeThemeId, type: "theme" });
    }

    public async setColorPalette(activeColorPaletteId: string): Promise<void> {
        return this.setSetting("ACTIVE_COLOR_PALETTE", { id: activeColorPaletteId, type: "colorPalette" });
    }

    public async deleteTheme() {
        return this.deleteSettingByType("ACTIVE_THEME");
    }

    public async deleteColorPalette() {
        return this.deleteSettingByType("ACTIVE_COLOR_PALETTE");
    }

    public getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return getSettingsForCurrentUser(this.authCall, this.workspace);
    }

    protected async getSettingByType(type: TigerSettingsType) {
        return this.authCall((client) =>
            client.entities.getAllEntitiesWorkspaceSettings({
                workspaceId: this.workspace,
                origin: "NATIVE",
                filter: `type==${type}`,
            }),
        );
    }

    protected async updateSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall(async (client) =>
            client.entities.updateEntityWorkspaceSettings({
                workspaceId: this.workspace,
                objectId: id,
                jsonApiWorkspaceSettingInDocument: {
                    data: {
                        type: "workspaceSetting",
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
        return this.authCall(async (client) =>
            client.entities.createEntityWorkspaceSettings({
                workspaceId: this.workspace,
                jsonApiWorkspaceSettingPostOptionalIdDocument: {
                    data: {
                        type: "workspaceSetting",
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

    protected async deleteSettingByType(type: TigerSettingsType): Promise<any> {
        const settings = await this.getSettingByType(type);
        for (const setting of settings.data.data) {
            await this.authCall(async (client) =>
                client.entities.deleteEntityWorkspaceSettings({
                    workspaceId: this.workspace,
                    objectId: setting.id,
                }),
            );
        }
    }
}

/**
 * @internal
 */
async function resolveSettings(authCall: TigerAuthenticatedCallGuard, workspace: string): Promise<ISettings> {
    const { data } = await authCall(async (client) =>
        client.actions.workspaceResolveAllSettings({
            workspaceId: workspace,
        }),
    );

    return data.reduce((result: ISettings, setting) => {
        const key = mapTypeToKey(setting.type, setting.id);
        if (key === "dateFilterConfig") {
            return {
                ...result,
                [key]: convertDateFilterConfig(
                    (setting.content as { config: IWrappedDateFilterConfig })?.config,
                ),
            };
        }
        return {
            ...result,
            [key]: unwrapSettingContent(setting.content),
        };
    }, {});
}

/**
 * Expose this wrapper to other SPI implementations
 *
 * @internal
 */
export function getSettingsForCurrentUser(
    authCall: TigerAuthenticatedCallGuard,
    workspace: string,
): Promise<IUserWorkspaceSettings> {
    return authCall(async (client) => {
        const profile = await client.profile.getCurrent();
        const {
            data: {
                data: { meta: config, attributes: wsAttributes },
            },
        } = await client.entities.getEntityWorkspaces({
            id: workspace,
            ...GET_OPTIMIZED_WORKSPACE_PARAMS,
        });

        const resolvedSettings: ISettings = await resolveSettings(authCall, workspace);

        const context: Partial<FeatureContext> = {
            jsSdkVersion: LIB_VERSION,
        };

        const staticFeaturesEarlyAccess = isStaticFeatures(profile.features)
            ? (profile.features?.static?.context?.earlyAccessValues ?? [])
            : [];

        const liveFeaturesEarlyAccess = isLiveFeatures(profile.features)
            ? (profile.features?.live?.context?.earlyAccessValues ?? [])
            : [];

        const tier = getOrganizationTier(profile.entitlements);
        const controlledFeatureRollout = getControlledFeatureRollout(profile.entitlements);

        if (tier !== undefined) {
            context.tier = tier;
        }

        if (controlledFeatureRollout) {
            context.controlledFeatureRollout = controlledFeatureRollout;
        }

        if (profile?.organizationId) {
            context.organizationId = profile.organizationId;
        }

        if (staticFeaturesEarlyAccess.length > 0) {
            context.earlyAccessValues = [...(context.earlyAccessValues || []), ...staticFeaturesEarlyAccess];
        }

        if (liveFeaturesEarlyAccess.length > 0) {
            context.earlyAccessValues = [...(context.earlyAccessValues || []), ...liveFeaturesEarlyAccess];
        }

        if (wsAttributes?.earlyAccessValues) {
            context.earlyAccessValues = [
                ...(context.earlyAccessValues || []),
                ...wsAttributes.earlyAccessValues,
            ];
        }

        const features = await new TigerFeaturesService(authCall).getFeatures(profile, context);

        return {
            ...DefaultUserSettings,
            userId: profile.userId,
            workspace,
            ...config?.config,
            ...features,
            ...resolvedSettings,
        };
    });
}
