// (C) 2019-2024 GoodData Corporation

import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import {
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAttributeHierarchiesService,
    IAuthenticatedPrincipal,
    IAuthenticationProvider,
    IBackendCapabilities,
    IDataSourcesService,
    IDateFilterConfigsQuery,
    IDateFilterConfigsQueryResult,
    IEntitlements,
    IExecutionFactory,
    IOrganization,
    IOrganizationPermissionService,
    IOrganizationSettingsService,
    IOrganizationStylingService,
    IOrganizationUserService,
    IOrganizations,
    ISecuritySettingsService,
    IUserService,
    IUserSettingsService,
    IUserWorkspaceSettings,
    IWorkspaceAccessControlService,
    IWorkspaceAttributesService,
    IWorkspaceCatalogFactory,
    IWorkspaceDashboardsService,
    IWorkspaceDatasetsService,
    IWorkspaceDescriptor,
    IWorkspaceExportDefinitionsService,
    IWorkspaceFactsService,
    IWorkspaceInsightsService,
    IWorkspaceMeasuresService,
    IWorkspacePermissionsService,
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    IWorkspaceUserGroupsQuery,
    IWorkspaceUsersQuery,
    IWorkspacesQueryFactory,
    NotSupported,
    ValidationContext,
    IDataFiltersService,
    IWorkspaceLogicalModelService,
    IOrganizationNotificationChannelService,
    IWorkspaceAutomationService,
} from "@gooddata/sdk-backend-spi";
import {
    IColorPalette,
    IColorPaletteDefinition,
    IColorPaletteMetadataObject,
    IOrganizationDescriptor,
    ISeparators,
    ITheme,
    IThemeDefinition,
    IThemeMetadataObject,
    IUser,
    IWorkspacePermissions,
    IWebhookMetadataObject,
    idRef,
} from "@gooddata/sdk-model";
import RecordedAttributeHierarchiesService from "./attributeHierarchies.js";
import { RecordedAttributes } from "./attributes.js";
import { RecordedCatalogFactory } from "./catalog.js";
import { RecordedDashboards } from "./dashboards.js";
import { RecordedExecutionFactory } from "./execution.js";
import { RecordedFacts } from "./facts.js";
import { RecordedInsights } from "./insights.js";
import { RecordedMeasures } from "./measures.js";
import { RecordedBackendConfig, RecordingIndex } from "./types.js";
import {
    RecordedWorkspaceUsersQuery,
    recordedAccessControlFactory,
    recordedUserGroupsQuery,
} from "./userManagement.js";

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
    const backend: IAnalyticalBackend = {
        capabilities,
        config,
        onHostname(hostname: string): IAnalyticalBackend {
            return recordedBackend(index, { ...config, hostname });
        },
        withTelemetry(_component: string, _props: object): IAnalyticalBackend {
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
            return recordedDescriptor(this.workspace, implConfig);
        },
        async updateDescriptor(): Promise<void> {
            throw new NotSupported("not supported");
        },
        getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined> {
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
                    return {
                        workspace,
                        ...(implConfig.globalSettings ?? {}),
                    };
                },
                async getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
                    return {
                        userId: USER_ID,
                        workspace,
                        locale,
                        separators,
                        ...(implConfig.globalSettings ?? {}),
                    };
                },
                async setLocale(): Promise<void> {
                    return Promise.resolve();
                },
                async setColorPalette(): Promise<void> {
                    return Promise.resolve();
                },
                async setTheme(): Promise<void> {
                    return Promise.resolve();
                },
            };
        },
        styling(): IWorkspaceStylingService {
            return {
                async getColorPalette(): Promise<IColorPalette> {
                    return implConfig.globalPalette ?? [];
                },
                async getTheme(): Promise<ITheme> {
                    return implConfig.theme ?? {};
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
        updateDescriptor(): Promise<void> {
            return Promise.resolve();
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
                setTimezone: () => Promise.resolve(),
                setDateFormat: () => Promise.resolve(),
                setWeekStart: () => Promise.resolve(),
                getSettings: () => Promise.resolve({}),
                setTheme: () => Promise.resolve(),
                setColorPalette: () => Promise.resolve(),
                setOpenAiConfig: () => Promise.resolve(),
                deleteTheme: () => Promise.resolve(),
                deleteColorPalette: () => Promise.resolve(),
            };
        },
        notificationChannels(): IOrganizationNotificationChannelService {
            return {
                getWebhooks: () => Promise.resolve([]),
                getWebhook: () =>
                    Promise.resolve({
                        id: "webhook-id",
                        name: "webhook-name",
                        token: "webhook-token",
                        endpoint: "webhook-endpoint",
                        triggers: [],
                    }),
                createWebhook: (webhook) =>
                    Promise.resolve({
                        ...webhook,
                        id: "webhook-id",
                    } as IWebhookMetadataObject),
                updateWebhook: (webhook) => Promise.resolve(webhook),
                deleteWebhook: () => Promise.resolve(),
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
                removeUsersFromUserGroups: () => Promise.resolve(),
                updateUser: () => Promise.resolve(),
                updateUserGroup: () => Promise.resolve(),
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
            return (
                implConfig.userManagement?.user ?? {
                    login: USER_ID,
                    ref: idRef(USER_ID),
                    email: "",
                    fullName: "",
                    firstName: "",
                    lastName: "",
                }
            );
        },
        settings(): IUserSettingsService {
            return {
                getSettings: async () => ({
                    userId: USER_ID,
                    locale,
                    separators,
                    ...(implConfig.globalSettings ?? {}),
                }),
                setLocale: () => Promise.resolve(),
            };
        },
    };
}

// return true for all
function recordedPermissionsFactory(): IWorkspacePermissionsService {
    return {
        getPermissionsForCurrentUser: async (): Promise<IWorkspacePermissions> => ({
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
    };
}
