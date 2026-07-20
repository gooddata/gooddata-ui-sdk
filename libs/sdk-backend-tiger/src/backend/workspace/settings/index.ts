// (C) 2019-2026 GoodData Corporation

import { type FeatureContext, isLiveFeatures, isStaticFeatures } from "@gooddata/api-client-tiger";
import { ActionsApi_WorkspaceResolveAllSettings } from "@gooddata/api-client-tiger/endpoints/actions";
import {
    EntitiesApi_CreateEntityWorkspaceSettings,
    EntitiesApi_DeleteEntityWorkspaceSettings,
    EntitiesApi_GetAllEntitiesWorkspaceSettings,
    EntitiesApi_GetEntityWorkspaces,
    EntitiesApi_UpdateEntityWorkspaceSettings,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ProfileApi_GetCurrent } from "@gooddata/api-client-tiger/endpoints/profile";
import {
    type IUserWorkspaceSettings,
    type IWorkspaceSettings,
    type IWorkspaceSettingsService,
} from "@gooddata/sdk-backend-spi";
import {
    type DashboardFiltersApplyMode,
    type IActiveCalendars,
    type IAiRateLimit,
    type IAlertDefault,
    type IDefaultExportTemplate,
    type IFiscalYear,
    type ISeparators,
    type ISettings,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { LIB_VERSION } from "../../../__version.js";
import {
    type IWrappedDateFilterConfig,
    convertDateFilterConfig,
} from "../../../convertors/fromBackend/DateFilterConfigurationConverter.js";
import { unwrapSettingContent } from "../../../convertors/fromBackend/SettingsConverter.js";
import { type TigerAuthenticatedCallGuard, type TigerSettingsType } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";
import {
    TigerFeaturesService,
    getControlledFeatureRollout,
    getOrganizationTier,
} from "../../features/index.js";
import { mapTypeToKey } from "../../settings/mapping.js";
import { invalidateSettingsResponses, trackSettingsResponse } from "../../settings/responseCacheCoherence.js";
import { TigerSettingsService } from "../../settings/settings.js";
import { DefaultUserSettings } from "../../uiSettings.js";
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

    public override async getSettings(): Promise<IWorkspaceSettings> {
        const resolvedSettings = await resolveSettings(this.authCall, this.workspace, true);
        return {
            workspace: this.workspace,
            ...resolvedSettings,
        };
    }

    public override async setAlertDefault(value: IAlertDefault): Promise<void> {
        return this.setSetting("ALERT", value);
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

    public override async setSeparators(separators: ISeparators): Promise<void> {
        return this.setSetting("SEPARATORS", separators);
    }

    public async setActiveLlmEndpoint(): Promise<void> {
        throw new Error("Deprecated endpoint");
    }

    public async setActiveLlmProvider(provider: string, defaultModelId: string): Promise<void> {
        return this.setSetting("ACTIVE_LLM_PROVIDER", { id: provider, type: "llmProvider", defaultModelId });
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

    public async setFiscalCalendar(fiscalYear: IFiscalYear): Promise<void> {
        return this.setSetting("FISCAL_YEAR", fiscalYear);
    }

    public async setActiveCalendars(calendars: IActiveCalendars): Promise<void> {
        return this.setSetting("ACTIVE_CALENDARS", calendars);
    }

    public async setDashboardFiltersApplyMode(
        dashboardFiltersApplyMode: DashboardFiltersApplyMode,
    ): Promise<void> {
        return this.setSetting("DASHBOARD_FILTERS_APPLY_MODE", dashboardFiltersApplyMode);
    }

    public async deleteDashboardFiltersApplyMode(): Promise<void> {
        return this.deleteSettingByType("DASHBOARD_FILTERS_APPLY_MODE");
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

    public async getEnableDrillToUrlByDefault(): Promise<boolean | undefined> {
        const settings = await this.getSettingByType("ENABLE_DRILL_TO_URL_BY_DEFAULT");
        if (settings.data.data.length === 0) {
            return undefined;
        }
        const content = settings.data.data[0].attributes?.content;
        return unwrapSettingContent(content) as boolean | undefined;
    }

    public async getExportCsvCustomDelimiter(): Promise<string | undefined> {
        const settings = await this.getSettingByType("EXPORT_CSV_CUSTOM_DELIMITER");
        if (settings.data.data.length === 0) {
            return undefined;
        }
        const content = settings.data.data[0].attributes?.content;
        return unwrapSettingContent(content) as string | undefined;
    }

    public async setEnableDrillToUrlByDefault(enabled: boolean): Promise<void> {
        return this.setSetting("ENABLE_DRILL_TO_URL_BY_DEFAULT", { value: enabled });
    }

    public async setEnablePartialDataResults(enabled: boolean): Promise<void> {
        return this.setSetting("ENABLE_PARTIAL_DATA_RESULTS", { value: enabled });
    }

    public async setEnableNullJoins(enabled: boolean): Promise<void> {
        return this.setSetting("ENABLE_NULL_JOINS", { value: enabled });
    }

    public async setEnableQueryTags(enabled: boolean): Promise<void> {
        return this.setSetting("ENABLE_QUERY_TAGS", { value: enabled });
    }

    public async setExportCsvCustomDelimiter(delimiter: string): Promise<void> {
        return this.setSetting("EXPORT_CSV_CUSTOM_DELIMITER", { value: delimiter });
    }

    public async deleteEnableDrillToUrlByDefault(): Promise<void> {
        return this.deleteSettingByType("ENABLE_DRILL_TO_URL_BY_DEFAULT");
    }

    public async deleteExportCsvCustomDelimiter(): Promise<void> {
        return this.deleteSettingByType("EXPORT_CSV_CUSTOM_DELIMITER");
    }

    public override async setTheme(activeTheme: string | ObjRef): Promise<void> {
        return this.setSetting(
            "ACTIVE_THEME",
            this.resolveActiveStyleContent(activeTheme, "theme", "workspaceTheme"),
        );
    }

    public override async setColorPalette(activeColorPalette: string | ObjRef): Promise<void> {
        return this.setSetting(
            "ACTIVE_COLOR_PALETTE",
            this.resolveActiveStyleContent(activeColorPalette, "colorPalette", "workspaceColorPalette"),
        );
    }

    /**
     * Build the active-styling setting content from a reference. A bare id string (or an untyped/org-typed
     * reference) is treated as organization-scoped; only a reference explicitly typed as the workspace scope
     * activates the workspace collection. The scope must be explicit so the id resolves against the right
     * scope with no cross-scope fallback.
     */
    private resolveActiveStyleContent(
        ref: string | ObjRef,
        organizationType: "theme" | "colorPalette",
        workspaceType: "workspaceTheme" | "workspaceColorPalette",
    ): { id: string; type: string } {
        if (typeof ref === "string") {
            return { id: ref, type: organizationType };
        }
        const id = objRefToIdentifier(ref, this.authCall);
        const refType = isIdentifierRef(ref) ? ref.type : undefined;
        // A bare / uri / untyped reference defaults to the organization scope. A reference whose type is set
        // but is neither the organization nor the workspace scope for this kind is a caller error - reject it
        // rather than silently reinterpreting it as organization-scoped.
        if (refType && refType !== organizationType && refType !== workspaceType) {
            throw new Error(
                `Cannot set active ${organizationType}: reference type "${refType}" is neither ` +
                    `"${organizationType}" nor "${workspaceType}".`,
            );
        }
        return { id, type: refType === workspaceType ? workspaceType : organizationType };
    }

    public async deleteTheme() {
        return this.deleteSettingByType("ACTIVE_THEME");
    }

    public async deleteColorPalette() {
        return this.deleteSettingByType("ACTIVE_COLOR_PALETTE");
    }

    public async deleteMetricFormatOverride(): Promise<void> {
        return this.deleteSettingByType("METRIC_FORMAT_OVERRIDE");
    }

    public getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return getSettingsForCurrentUser(this.authCall, this.workspace);
    }

    protected override async getSettingByType(type: TigerSettingsType) {
        return this.authCall((client) =>
            EntitiesApi_GetAllEntitiesWorkspaceSettings(client.axios, client.basePath, {
                workspaceId: this.workspace,
                origin: "NATIVE",
                filter: `type==${type}`,
            }),
        );
    }

    protected override async updateSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        const result = await this.authCall(async (client) =>
            EntitiesApi_UpdateEntityWorkspaceSettings(client.axios, client.basePath, {
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
        await invalidateSettingsResponses(this.authCall);
        return result;
    }

    protected override async createSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        const result = await this.authCall(async (client) =>
            EntitiesApi_CreateEntityWorkspaceSettings(client.axios, client.basePath, {
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
        await invalidateSettingsResponses(this.authCall);
        return result;
    }

    protected override async deleteSettingByType(type: TigerSettingsType): Promise<any> {
        const settings = await this.getSettingByType(type);
        let deleted = false;
        try {
            for (const setting of settings.data.data) {
                await this.authCall(async (client) =>
                    EntitiesApi_DeleteEntityWorkspaceSettings(client.axios, client.basePath, {
                        workspaceId: this.workspace,
                        objectId: setting.id,
                    }),
                );
                deleted = true;
            }
        } finally {
            // A failure partway still leaves earlier deletions persisted — invalidate for those.
            if (deleted) {
                await invalidateSettingsResponses(this.authCall);
            }
        }
    }
}

/**
 * Extracts the currency format override from metricFormatOverride settings.
 * Handles both uppercase "CURRENCY" and lowercase "currency" keys for compatibility.
 */
function resolveCurrencyFormatOverride(
    metricFormatOverride: { formats?: Record<string, string> | null } | undefined,
): string | null {
    const formats = metricFormatOverride?.formats;
    if (!formats) {
        return null;
    }
    return formats["CURRENCY"] ?? formats["currency"] ?? null;
}

/**
 * @internal
 */
async function resolveSettings(
    authCall: TigerAuthenticatedCallGuard,
    workspace: string,
    excludeUserSettings = false,
): Promise<ISettings> {
    const { data } = await authCall(async (client) =>
        trackSettingsResponse(
            client.axios,
            `ws:${workspace}:${excludeUserSettings ? "excludeUser" : "withUser"}`,
            (requestOptions) =>
                ActionsApi_WorkspaceResolveAllSettings(
                    client.axios,
                    client.basePath,
                    {
                        workspaceId: workspace,
                        excludeUserSettings: excludeUserSettings || undefined,
                    },
                    requestOptions,
                ),
        ),
    );

    const settings = data.reduce((result: ISettings, setting) => {
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

    // Normalize currency format override for convenience
    const currencyFormatOverride = resolveCurrencyFormatOverride(settings.metricFormatOverride);

    return {
        ...settings,
        currencyFormatOverride,
    };
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
        // Fire independent requests in parallel to avoid unnecessary waterfall.
        const [profile, workspaceEntity, resolvedSettings] = await Promise.all([
            ProfileApi_GetCurrent(client.axios),
            EntitiesApi_GetEntityWorkspaces(client.axios, client.basePath, {
                id: workspace,
                ...GET_OPTIMIZED_WORKSPACE_PARAMS,
            }),
            resolveSettings(authCall, workspace),
        ]);

        const {
            data: {
                data: { meta: config, attributes: wsAttributes },
            },
        } = workspaceEntity;

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
