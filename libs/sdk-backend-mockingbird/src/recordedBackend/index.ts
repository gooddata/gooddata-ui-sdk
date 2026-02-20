// (C) 2019-2026 GoodData Corporation

import {
    DummyGenAIChatThread,
    DummySemanticSearchQueryBuilder,
    InMemoryPaging,
} from "@gooddata/sdk-backend-base";
import {
    type IAnalyticalBackend,
    type IAnalyticalWorkspace,
    type IAttributeHierarchiesService,
    type IAuthenticatedPrincipal,
    type IAuthenticationProvider,
    type IBackendCapabilities,
    type IChatThread,
    type IDataFiltersService,
    type IDataSourcesService,
    type IDateFilterConfigsQuery,
    type IDateFilterConfigsQueryResult,
    type IEntitlements,
    type IExecutionFactory,
    type IGenAIService,
    type IGeoService,
    type IOrganization,
    type IOrganizationLlmEndpointsService,
    type IOrganizationNotificationChannelService,
    type IOrganizationNotificationService,
    type IOrganizationPermissionService,
    type IOrganizationSettingsService,
    type IOrganizationStylingService,
    type IOrganizationUserService,
    type IOrganizations,
    type IReferencesService,
    type ISecuritySettingsService,
    type IUserService,
    type IUserSettingsService,
    type IUserWorkspaceSettings,
    type IWorkspaceAccessControlService,
    type IWorkspaceAttributesService,
    type IWorkspaceAutomationService,
    type IWorkspaceCatalogFactory,
    type IWorkspaceDashboardsService,
    type IWorkspaceDatasetsService,
    type IWorkspaceDescriptor,
    type IWorkspaceExportDefinitionsService,
    type IWorkspaceFactsService,
    type IWorkspaceInsightsService,
    type IWorkspaceKeyDriverAnalysisService,
    type IWorkspaceLogicalModelService,
    type IWorkspaceMeasuresService,
    type IWorkspacePermissionsService,
    type IWorkspaceSettings,
    type IWorkspaceSettingsService,
    type IWorkspaceStylingService,
    type IWorkspaceUserGroupsQuery,
    type IWorkspaceUsersQuery,
    type IWorkspacesQueryFactory,
    NotSupported,
    type ValidationContext,
} from "@gooddata/sdk-backend-spi";
import {
    type IColorPalette,
    type IColorPaletteDefinition,
    type IColorPaletteMetadataObject,
    type ILlmEndpointBase,
    type ILlmEndpointOpenAI,
    type IMetricFormatOverrideSetting,
    type INotificationChannelMetadataObject,
    type IOrganizationDescriptor,
    type ISeparators,
    type ITheme,
    type IThemeDefinition,
    type IThemeMetadataObject,
    type IUser,
    type IWorkspacePermissions,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import { RecordedAttributeHierarchiesService } from "./attributeHierarchies.js";
import { RecordedAttributes } from "./attributes.js";
import { RecordedCatalogFactory } from "./catalog.js";
import { RecordedDashboards } from "./dashboards.js";
import { RecordedExecutionFactory } from "./execution.js";
import { RecordedFacts } from "./facts.js";
import { RecordedInsights } from "./insights.js";
import { RecordedMeasures } from "./measures.js";
import { type RecordedBackendConfig, type RecordingIndex } from "./types.js";
import {
    RecordedWorkspaceUsersQuery,
    recordedAccessControlFactory,
    recordedUserGroupsQuery,
} from "./userManagement.js";
import { createMockGeoService } from "../geoService.js";

const defaultConfig: RecordedBackendConfig = {
    hostname: "test",
};

const USER_ID = "recordedUser";
const locale = "en-US";
const separators: ISeparators = {
    thousand: ",",
    decimal: ".",
};

/**
 * @internal
 */
export const defaultRecordedBackendCapabilities: IBackendCapabilities = {
    canCalculateGrandTotals: true,
    canCalculateSubTotals: true,
    canCalculateTotals: true,
    canCalculateNativeTotals: true,
    supportsCsvUploader: true,
    supportsKpiWidget: false,
    supportsWidgetEntity: true,
    supportsOwners: true,
    allowsInconsistentRelations: false,
    supportsHierarchicalWorkspaces: false,
    supportsCustomColorPalettes: true,
    supportsElementsQueryParentFiltering: true,
    supportsElementUris: true,
    supportsEveryoneUserGroupForAccessControl: true,
};

/**
 * Creates new backend that will be providing recorded results to the caller. The recorded results are provided
 * to the backend in the form of RecordingIndex. This contains categorized recordings for the different service
 * calls.
 *
 * Note that:
 * - the 'tools/mock-handling' program can be used to create recordings AND the recording index.
 * - typically you want to use this recordedBackend with the recordings from the reference workspace; there
 *   is already tooling and infrastructure around populating that project
 *
 * @param index - recording index
 * @param config - backend config, for now just for compatibility sakes with the analytical backend config
 * @param capabilities - backend capabilities to use
 * @internal
 */
export function recordedBackend(
    index: RecordingIndex,
    config: RecordedBackendConfig = defaultConfig,
    capabilities = defaultRecordedBackendCapabilities,
): IAnalyticalBackend {
    const geoService = createMockGeoService(config.geoStyleSpecification);

    const backend: IAnalyticalBackend = {
        capabilities,
        config,
        onHostname(hostname: string): IAnalyticalBackend {
            return recordedBackend(index, { ...config, hostname });
        },
        withTelemetry(_component: string, _props: object): IAnalyticalBackend {
            return backend;
        },
        withCorrelation(_correlationMetadata: Record<string, string>): IAnalyticalBackend {
            return backend;
        },
        withAuthentication(_: IAuthenticationProvider): IAnalyticalBackend {
            return this;
        },
        organization(organizationId: string): IOrganization {
            return recordedOrganization(organizationId, config);
        },
        organizations(): IOrganizations {
            return recordedOrganizations(config);
        },
        currentUser(): IUserService {
            return recordedUserService(config);
        },
        workspace(id: string): IAnalyticalWorkspace {
            return recordedWorkspace(id, index, config);
        },
        workspaces(): IWorkspacesQueryFactory {
            throw new NotSupported("not supported");
        },
        authenticate(): Promise<IAuthenticatedPrincipal> {
            return Promise.resolve({ userId: USER_ID });
        },
        deauthenticate(): Promise<void> {
            return Promise.resolve();
        },
        isAuthenticated(): Promise<IAuthenticatedPrincipal | null> {
            return Promise.resolve({ userId: USER_ID });
        },
        entitlements(): IEntitlements {
            return recordedEntitlements();
        },
        dataSources(): IDataSourcesService {
            throw new NotSupported("not supported");
        },
        geo(): IGeoService {
            return geoService;
        },
    };

    return backend;
}

function recordedWorkspace(
    workspace: string,
    recordings: RecordingIndex = {},
    implConfig: RecordedBackendConfig,
): IAnalyticalWorkspace {
    const insightsService = new RecordedInsights(recordings, implConfig.useRefType ?? "uri");

    return {
        workspace,
        async getDescriptor(): Promise<IWorkspaceDescriptor> {
            return Promise.resolve(recordedDescriptor(this.workspace, implConfig));
        },
        updateDescriptor(): Promise<IWorkspaceDescriptor> {
            throw new NotSupported("not supported");
        },
        getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined> {
            throw new NotSupported("not supported");
        },
        keyDriverAnalysis(): IWorkspaceKeyDriverAnalysisService {
            throw new NotSupported("not supported");
        },
        execution(): IExecutionFactory {
            return new RecordedExecutionFactory(recordings, workspace, implConfig.useRefType ?? "uri");
        },
        attributes(): IWorkspaceAttributesService {
            return new RecordedAttributes(recordings, implConfig);
        },
        measures(): IWorkspaceMeasuresService {
            return new RecordedMeasures();
        },
        facts(): IWorkspaceFactsService {
            return new RecordedFacts();
        },
        insights(): IWorkspaceInsightsService {
            return insightsService;
        },
        dashboards(): IWorkspaceDashboardsService {
            return new RecordedDashboards(this.workspace, insightsService, recordings);
        },
        settings(): IWorkspaceSettingsService {
            return {
                async getSettings(): Promise<IWorkspaceSettings> {
                    return Promise.resolve({
                        workspace,
                        ...(implConfig.globalSettings ?? {}),
                    });
                },
                async getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
                    return Promise.resolve({
                        userId: USER_ID,
                        workspace,
                        locale,
                        separators,
                        ...(implConfig.globalSettings ?? {}),
                    });
                },
                async setAlertDefault(): Promise<void> {
                    return Promise.resolve();
                },
                async setLocale(): Promise<void> {
                    return Promise.resolve();
                },
                async setMetadataLocale(): Promise<void> {
                    return Promise.resolve();
                },
                async setFormatLocale(): Promise<void> {
                    return Promise.resolve();
                },
                async setSeparators(): Promise<void> {
                    return Promise.resolve();
                },
                async setActiveLlmEndpoint(): Promise<void> {
                    return Promise.resolve();
                },
                async setTimezone(): Promise<void> {
                    return Promise.resolve();
                },
                async setDateFormat(): Promise<void> {
                    return Promise.resolve();
                },
                async setWeekStart(): Promise<void> {
                    return Promise.resolve();
                },
                async setFiscalCalendar(): Promise<void> {
                    return Promise.resolve();
                },
                async setDashboardFiltersApplyMode(): Promise<void> {
                    return Promise.resolve();
                },
                async deleteDashboardFiltersApplyMode(): Promise<void> {
                    return Promise.resolve();
                },
                async setEnableAiOnData(): Promise<void> {
                    return Promise.resolve();
                },
                async getEnableDrillToUrlByDefault(): Promise<boolean | undefined> {
                    return Promise.resolve(undefined);
                },
                async setEnableDrillToUrlByDefault(): Promise<void> {
                    return Promise.resolve();
                },
                async deleteEnableDrillToUrlByDefault(): Promise<void> {
                    return Promise.resolve();
                },
                async setColorPalette(): Promise<void> {
                    return Promise.resolve();
                },
                async setTheme(): Promise<void> {
                    return Promise.resolve();
                },
                async deleteColorPalette(): Promise<void> {
                    return Promise.resolve();
                },
                async deleteTheme(): Promise<void> {
                    return Promise.resolve();
                },
                async setMetricFormatOverride(_override: IMetricFormatOverrideSetting): Promise<void> {
                    return Promise.resolve();
                },
                async deleteMetricFormatOverride(): Promise<void> {
                    return Promise.resolve();
                },
                async setActiveCalendars(): Promise<void> {
                    return Promise.resolve();
                },
            };
        },
        styling(): IWorkspaceStylingService {
            return {
                async getColorPalette(): Promise<IColorPalette> {
                    return Promise.resolve(implConfig.globalPalette ?? []);
                },
                async getTheme(): Promise<ITheme> {
                    return Promise.resolve(implConfig.theme ?? {});
                },
                async getActiveTheme(): Promise<ObjRef | undefined> {
                    return Promise.resolve(undefined);
                },
                async setActiveTheme(): Promise<void> {
                    return Promise.resolve(undefined);
                },
                async getActiveColorPalette(): Promise<ObjRef | undefined> {
                    return Promise.resolve(undefined);
                },
                async setActiveColorPalette(): Promise<void> {
                    return Promise.resolve(undefined);
                },
                clearActiveColorPalette(): Promise<void> {
                    return Promise.resolve(undefined);
                },
                clearActiveTheme(): Promise<void> {
                    return Promise.resolve(undefined);
                },
            };
        },
        dateFilterConfigs(): IDateFilterConfigsQuery {
            return recordedDateFilterConfig(implConfig);
        },
        catalog(): IWorkspaceCatalogFactory {
            return new RecordedCatalogFactory(workspace, recordings, implConfig);
        },
        datasets(): IWorkspaceDatasetsService {
            throw new NotSupported("not supported");
        },
        permissions(): IWorkspacePermissionsService {
            return recordedPermissionsFactory();
        },
        users(): IWorkspaceUsersQuery {
            return new RecordedWorkspaceUsersQuery(implConfig);
        },
        userGroups(): IWorkspaceUserGroupsQuery {
            return recordedUserGroupsQuery(implConfig);
        },
        accessControl(): IWorkspaceAccessControlService {
            return recordedAccessControlFactory(implConfig);
        },
        attributeHierarchies(): IAttributeHierarchiesService {
            return new RecordedAttributeHierarchiesService(implConfig);
        },
        exportDefinitions(): IWorkspaceExportDefinitionsService {
            throw new NotSupported("not supported");
        },
        dataFilters(): IDataFiltersService {
            throw new NotSupported("not supported");
        },
        logicalModel(): IWorkspaceLogicalModelService {
            throw new NotSupported("not supported");
        },
        automations(): IWorkspaceAutomationService {
            throw new NotSupported("not supported");
        },
        genAI(): IGenAIService {
            return {
                getChatThread(): IChatThread {
                    return new DummyGenAIChatThread();
                },
                getSemanticSearchQuery: () => {
                    return new DummySemanticSearchQueryBuilder(workspace);
                },
                semanticSearchIndex: () => {
                    throw new NotSupported("not supported");
                },
                getLlmEndpoints(): Promise<ILlmEndpointBase[]> {
                    throw new NotSupported("not supported");
                },
                getMemoryItems: () => {
                    throw new NotSupported("not supported");
                },
                getAnalyticsCatalog() {
                    throw new NotSupported("not supported");
                },
                getSemanticQuality() {
                    throw new NotSupported("not supported");
                },
            };
        },
        references(): IReferencesService {
            return {
                getReferences() {
                    return Promise.resolve({
                        nodes: [],
                        edges: [],
                    });
                },
            };
        },
    };
}

function recordedEntitlements(): IEntitlements {
    return {
        resolveEntitlements: () => {
            return Promise.resolve([]);
        },
    };
}

function recordedOrganization(organizationId: string, implConfig: RecordedBackendConfig): IOrganization {
    const scopeFactory =
        implConfig.securitySettingsOrganizationScope === undefined
            ? (organizationId: string) => `/gdc/domains/${organizationId}`
            : implConfig.securitySettingsOrganizationScope;
    return {
        organizationId,
        getDescriptor(): Promise<IOrganizationDescriptor> {
            return Promise.resolve({
                id: organizationId,
                title: "mock organization",
            });
        },
        updateDescriptor(): Promise<IOrganizationDescriptor> {
            return Promise.resolve({
                id: organizationId,
                title: "mock organization",
            });
        },
        securitySettings(): ISecuritySettingsService {
            return {
                scope: scopeFactory(organizationId),
                isUrlValid(url: string, context: ValidationContext): Promise<boolean> {
                    if (implConfig.securitySettingsUrlValidator !== undefined) {
                        return Promise.resolve(implConfig.securitySettingsUrlValidator(url, context));
                    }
                    return Promise.resolve(true);
                },
                isDashboardPluginUrlValid(url: string, workspace: string): Promise<boolean> {
                    if (implConfig.securitySettingsPluginUrlValidator !== undefined) {
                        return Promise.resolve(implConfig.securitySettingsPluginUrlValidator(url, workspace));
                    }
                    return Promise.resolve(true);
                },
            };
        },
        styling(): IOrganizationStylingService {
            const resolveTheme = (theme: IThemeDefinition): Promise<IThemeMetadataObject> => {
                return Promise.resolve({
                    type: "theme",
                    id: "theme_id",
                    title: "Theme 1",
                    description: "",
                    production: true,
                    deprecated: false,
                    unlisted: false,
                    ref: idRef("theme_id"),
                    uri: "theme_uri",
                    theme: theme.theme,
                });
            };

            const resolveColorPalette = (
                colorPalette: IColorPaletteDefinition,
            ): Promise<IColorPaletteMetadataObject> =>
                Promise.resolve({
                    type: "colorPalette",
                    id: "color_palette_id",
                    title: "Color Palette 1",
                    description: "",
                    production: true,
                    deprecated: false,
                    unlisted: false,
                    ref: idRef("color_palette_id"),
                    uri: "color_palette_uri",
                    colorPalette: colorPalette.colorPalette,
                });

            return {
                getThemes: () => Promise.resolve([]),
                getActiveTheme: () => Promise.resolve(undefined),
                setActiveTheme: () => Promise.resolve(),
                clearActiveTheme: () => Promise.resolve(),
                createTheme: resolveTheme,
                updateTheme: resolveTheme,
                deleteTheme: () => Promise.resolve(),
                getColorPalettes: () => Promise.resolve([]),
                getActiveColorPalette: () => Promise.resolve(undefined),
                setActiveColorPalette: () => Promise.resolve(),
                clearActiveColorPalette: () => Promise.resolve(),
                createColorPalette: resolveColorPalette,
                updateColorPalette: resolveColorPalette,
                deleteColorPalette: () => Promise.resolve(),
            };
        },
        settings(): IOrganizationSettingsService {
            return {
                setWhiteLabeling: () => Promise.resolve(),
                setLocale: () => Promise.resolve(),
                setMetadataLocale: () => Promise.resolve(),
                setFormatLocale: () => Promise.resolve(),
                setSeparators: () => Promise.resolve(),
                setActiveLlmEndpoint: () => Promise.resolve(),
                deleteActiveLlmEndpoint: () => Promise.resolve(),
                setTimezone: () => Promise.resolve(),
                setDateFormat: () => Promise.resolve(),
                setWeekStart: () => Promise.resolve(),
                setFiscalCalendar: () => Promise.resolve(),
                getSettings: () => Promise.resolve({}),
                setTheme: () => Promise.resolve(),
                setColorPalette: () => Promise.resolve(),
                setOpenAiConfig: () => Promise.resolve(),
                setDashboardFiltersApplyMode: () => Promise.resolve(),
                setEnableDrillToUrlByDefault: () => Promise.resolve(),
                setAlertDefault: () => Promise.resolve(),
                deleteTheme: () => Promise.resolve(),
                deleteColorPalette: () => Promise.resolve(),
                setAttachmentSizeLimit: () => Promise.resolve(),
                setMaxZoomLevel: () => Promise.resolve(),
                setMetricFormatOverride: () => Promise.resolve(),
                setActiveCalendars: () => Promise.resolve(),
            };
        },
        notificationChannels(): IOrganizationNotificationChannelService {
            return {
                testNotificationChannel: () =>
                    Promise.resolve({
                        successful: true,
                    }),
                getNotificationChannel: () => Promise.resolve({} as INotificationChannelMetadataObject),
                createNotificationChannel: () => Promise.resolve({} as INotificationChannelMetadataObject),
                updateNotificationChannel: () => Promise.resolve({} as INotificationChannelMetadataObject),
                deleteNotificationChannel: () => Promise.resolve(),
                getNotificationChannelsQuery: () => {
                    throw new NotSupported("not supported");
                },
            };
        },
        notifications(): IOrganizationNotificationService {
            return {
                markNotificationAsRead: () => Promise.reject(new NotSupported("not supported")),
                markAllNotificationsAsRead: () => Promise.reject(new NotSupported("not supported")),
                getNotificationsQuery: () => {
                    throw new NotSupported("not supported");
                },
            };
        },
        permissions(): IOrganizationPermissionService {
            return {
                getOrganizationPermissionForUser: () => Promise.resolve([]),
                getOrganizationPermissionForUserGroup: () => Promise.resolve([]),
                updateOrganizationPermissions: () => Promise.resolve(),
                getPermissionsForUser: () =>
                    Promise.resolve({ workspacePermissions: [], dataSourcePermissions: [] }),
                getPermissionsForUserGroup: () =>
                    Promise.resolve({ workspacePermissions: [], dataSourcePermissions: [] }),
                assignPermissions: () => Promise.resolve(),
                revokePermissions: () => Promise.resolve(),
            };
        },
        users(): IOrganizationUserService {
            return {
                createUser: () => {
                    throw new NotSupported("not supported");
                },
                getUsersQuery: () => {
                    throw new NotSupported("not supported");
                },
                getUserGroupsQuery: () => {
                    throw new NotSupported("not supported");
                },
                addUsersToUserGroups: () => Promise.resolve(),
                createUserGroup: () => Promise.resolve(),
                deleteUsers: () => Promise.resolve(),
                deleteUserGroups: () => Promise.resolve(),
                getUser: () => Promise.resolve(undefined),
                getUserGroup: () => Promise.resolve(undefined),
                getUserGroups: () => Promise.resolve([]),
                getUserGroupsOfUser: () => Promise.resolve([]),
                getUsersOfUserGroup: () => Promise.resolve([]),
                getUsers: () => Promise.resolve([]),
                getUsersSummary: () => Promise.resolve([]),
                getUsersByEmail: () => Promise.resolve([]),
                removeUsersFromUserGroups: () => Promise.resolve(),
                updateUser: () => Promise.resolve(),
                updateUserGroup: () => Promise.resolve(),
            };
        },
        automations: () => {
            return {
                getAutomationsQuery: () => {
                    throw new NotSupported("not supported");
                },
                deleteAutomation: () => Promise.resolve(),
                deleteAutomations: () => Promise.resolve(),
                pauseAutomation: () => Promise.resolve(),
                resumeAutomation: () => Promise.resolve(),
                pauseAutomations: () => Promise.resolve(),
                resumeAutomations: () => Promise.resolve(),
                unsubscribeAutomation: () => Promise.resolve(),
                unsubscribeAutomations: () => Promise.resolve(),
            };
        },
        llmEndpoints(): IOrganizationLlmEndpointsService {
            const dummyEndpoint: ILlmEndpointOpenAI = {
                id: "dummyLlmEndpoint",
                title: "Dummy Llm Endpoint",
                provider: "OPENAI",
                model: "gpt-4o-mini",
            };

            return {
                getCount: () => Promise.resolve(0),
                getAll: () => Promise.resolve([]),
                deleteLlmEndpoint: () => Promise.resolve(),
                getLlmEndpoint: () =>
                    Promise.resolve({
                        ...dummyEndpoint,
                    }),
                createLlmEndpoint: () =>
                    Promise.resolve({
                        ...dummyEndpoint,
                    }),
                updateLlmEndpoint: () =>
                    Promise.resolve({
                        ...dummyEndpoint,
                    }),
                patchLlmEndpoint: () =>
                    Promise.resolve({
                        ...dummyEndpoint,
                    }),
                testLlmEndpoint: () =>
                    Promise.resolve({
                        success: true,
                    }),
            };
        },
    };
}

function recordedOrganizations(implConfig: RecordedBackendConfig): IOrganizations {
    return {
        getCurrentOrganization(): Promise<IOrganization> {
            return Promise.resolve(recordedOrganization("mock-organization", implConfig));
        },
    };
}

// returns the same settings as the global ones
function recordedUserService(implConfig: RecordedBackendConfig): IUserService {
    return {
        async getUser(): Promise<IUser> {
            return Promise.resolve(
                implConfig.userManagement?.user ?? {
                    login: USER_ID,
                    ref: idRef(USER_ID),
                    email: "",
                    fullName: "",
                    firstName: "",
                    lastName: "",
                },
            );
        },
        async getUserWithDetails(): Promise<IUser> {
            return Promise.resolve(
                implConfig.userManagement?.user ?? {
                    login: USER_ID,
                    ref: idRef(USER_ID),
                    email: "",
                    fullName: "",
                    firstName: "",
                    lastName: "",
                },
            );
        },
        settings(): IUserSettingsService {
            return {
                getSettings: async () =>
                    Promise.resolve({
                        userId: USER_ID,
                        locale,
                        separators,
                        ...(implConfig.globalSettings ?? {}),
                    }),
                setLocale: () => Promise.resolve(),
                setMetadataLocale: () => Promise.resolve(),
                setFormatLocale: () => Promise.resolve(),
                setSeparators: () => Promise.resolve(),
            };
        },
    };
}

// return true for all
function recordedPermissionsFactory(): IWorkspacePermissionsService {
    return {
        getPermissionsForCurrentUser: async (): Promise<IWorkspacePermissions> =>
            Promise.resolve({
                canAccessWorkbench: true,
                canCreateAnalyticalDashboard: true,
                canCreateReport: true,
                canCreateVisualization: true,
                canExecuteRaw: true,
                canExportReport: true,
                canExportTabular: true,
                canExportPdf: true,
                canInitData: true,
                canManageAnalyticalDashboard: true,
                canManageMetric: true,
                canManageProject: true,
                canManageReport: true,
                canUploadNonProductionCSV: true,
                canCreateScheduledMail: true,
                canListUsersInProject: true,
                canManageDomain: true,
                canInviteUserToProject: true,
                canRefreshData: true,
                canManageACL: true,
                canManageScheduledMail: true,
                canCreateFilterView: true,
                canCreateAutomation: true,
                canUseAiAssistant: true,
            }),
    };
}

function recordedDescriptor(workspaceId: string, implConfig: RecordedBackendConfig): IWorkspaceDescriptor {
    const { title, description, isDemo } = implConfig.workspaceDescriptor || {};

    return {
        id: workspaceId,
        title: title ?? "",
        description: description ?? "",
        isDemo: isDemo ?? false,
    };
}

function recordedDateFilterConfig(implConfig: RecordedBackendConfig): IDateFilterConfigsQuery {
    return {
        withLimit(_limit: number): IDateFilterConfigsQuery {
            return this;
        },
        withOffset(_offset: number): IDateFilterConfigsQuery {
            return this;
        },
        query(): Promise<IDateFilterConfigsQueryResult> {
            const { dateFilterConfig } = implConfig;

            return Promise.resolve(new InMemoryPaging(dateFilterConfig ? [dateFilterConfig] : []));
        },
        queryCustomDateFilterConfig(): Promise<IDateFilterConfigsQueryResult> {
            const { dateFilterConfig } = implConfig;

            return Promise.resolve(new InMemoryPaging(dateFilterConfig ? [dateFilterConfig] : []));
        },
    };
}
