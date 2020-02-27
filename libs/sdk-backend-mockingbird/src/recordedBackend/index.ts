// (C) 2019-2020 GoodData Corporation

import {
    AuthenticatedPrincipal,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IElementQueryFactory,
    IExecutionFactory,
    IWorkspaceCatalogFactory,
    IWorkspaceDatasetsService,
    IWorkspaceMetadata,
    IWorkspacePermissionsFactory,
    IWorkspaceQueryFactory,
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";
import { RecordedElementQueryFactory } from "./elements";
import { RecordedExecutionFactory } from "./execution";
import { RecordedMetadata } from "./metadata";
import { RecordedBackendConfig, RecordingIndex } from "./types";

const defaultConfig: RecordedBackendConfig = {
    hostname: "test",
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
 * @internal
 */
export function recordedBackend(
    index: RecordingIndex,
    config: RecordedBackendConfig = defaultConfig,
): IAnalyticalBackend {
    const backend: IAnalyticalBackend = {
        capabilities: {},
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

        workspace(id: string): IAnalyticalWorkspace {
            return recordedWorkspace(id, index, config);
        },
        workspaces(): IWorkspaceQueryFactory {
            throw new NotSupported("not supported");
        },
        authenticate(): Promise<AuthenticatedPrincipal> {
            return Promise.resolve({ userId: "recordedUser" });
        },
        deauthenticate(): Promise<void> {
            return Promise.resolve();
        },
        isAuthenticated(): Promise<AuthenticatedPrincipal | null> {
            return Promise.resolve({ userId: "recordedUser" });
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
        execution(): IExecutionFactory {
            return new RecordedExecutionFactory(recordings, workspace);
        },
        elements(): IElementQueryFactory {
            return new RecordedElementQueryFactory(recordings);
        },
        metadata(): IWorkspaceMetadata {
            return new RecordedMetadata(recordings);
        },
        settings(): IWorkspaceSettingsService {
            return {
                async query(): Promise<IWorkspaceSettings> {
                    return {
                        workspace,
                        ...(implConfig.globalSettings ?? {}),
                    };
                },
            };
        },
        styling(): IWorkspaceStylingService {
            return {
                async colorPalette(): Promise<IColorPalette> {
                    return implConfig.globalPalette ?? [];
                },
            };
        },
        catalog(): IWorkspaceCatalogFactory {
            throw new NotSupported("not supported");
        },
        dataSets(): IWorkspaceDatasetsService {
            throw new NotSupported("not supported");
        },
        permissions(): IWorkspacePermissionsFactory {
            throw new NotSupported("not supported");
        },
    };
}
