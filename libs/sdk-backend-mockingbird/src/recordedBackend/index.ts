// (C) 2019-2020 GoodData Corporation

import {
    IAuthenticatedPrincipal,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IExecutionFactory,
    IWorkspaceCatalogFactory,
    IWorkspaceDatasetsService,
    IWorkspaceAttributesService,
    IWorkspaceMeasuresService,
    IWorkspaceFactsService,
    IWorkspacePermissionsService,
    IWorkspacesQueryFactory,
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    NotSupported,
    IUserService,
    IWorkspaceInsightsService,
    IUserSettingsService,
    IWorkspaceDashboardsService,
    IUserWorkspaceSettings,
    IWorkspaceUsersQuery,
    IDateFilterConfigsQuery,
    IBackendCapabilities,
    IWorkspaceDescriptor,
    IWorkspacePermissions,
    ITheme,
} from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";
import { RecordedExecutionFactory } from "./execution";
import { RecordedBackendConfig, RecordingIndex } from "./types";
import { RecordedInsights } from "./insights";
import { RecordedCatalogFactory } from "./catalog";
import { RecordedAttributes } from "./attributes";
import { RecordedMeasures } from "./measures";
import { RecordedFacts } from "./facts";

const defaultConfig: RecordedBackendConfig = {
    hostname: "test",
};

const USER_ID = "recordedUser";
const locale = "en-US";

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
    capabilities: IBackendCapabilities = {
        canCalculateTotals: true,
    },
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
    };

    return backend;
}

function recordedWorkspace(
    workspace: string,
    recordings: RecordingIndex = {},
    implConfig: RecordedBackendConfig,
): IAnalyticalWorkspace {
    return {
        workspace,
        getDescriptor(): Promise<IWorkspaceDescriptor> {
            throw new NotSupported("not supported");
        },
        execution(): IExecutionFactory {
            return new RecordedExecutionFactory(recordings, workspace, implConfig.useRefType ?? "uri");
        },
        attributes(): IWorkspaceAttributesService {
            return new RecordedAttributes(recordings);
        },
        measures(): IWorkspaceMeasuresService {
            return new RecordedMeasures();
        },
        facts(): IWorkspaceFactsService {
            return new RecordedFacts();
        },
        insights(): IWorkspaceInsightsService {
            return new RecordedInsights(recordings, implConfig.useRefType ?? "uri");
        },
        dashboards(): IWorkspaceDashboardsService {
            throw new NotSupported("not supported");
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
                        ...(implConfig.globalSettings ?? {}),
                    };
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
        catalog(): IWorkspaceCatalogFactory {
            return new RecordedCatalogFactory(workspace, recordings);
        },
        datasets(): IWorkspaceDatasetsService {
            throw new NotSupported("not supported");
        },
        permissions(): IWorkspacePermissionsService {
            return recordedPermissionsFactory();
        },
        users(): IWorkspaceUsersQuery {
            throw new NotSupported("not supported");
        },
        dateFilterConfigs(): IDateFilterConfigsQuery {
            throw new NotSupported("not supported");
        },
    };
}

// returns the same settings as the global ones
function recordedUserService(implConfig: RecordedBackendConfig): IUserService {
    return {
        settings(): IUserSettingsService {
            return {
                getSettings: async () => ({
                    userId: USER_ID,
                    locale,
                    ...(implConfig.globalSettings ?? {}),
                }),
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
            canInitData: true,
            canManageAnalyticalDashboard: true,
            canManageMetric: true,
            canManageProject: true,
            canManageReport: true,
            canUploadNonProductionCSV: true,
            canCreateScheduledMail: true,
            canListUsersInProject: true,
            canManageDomain: true,
        }),
    };
}
