// (C) 2019-2020 GoodData Corporation

import {
    IAnalyticalWorkspace,
    IElementQueryFactory,
    IExecutionFactory,
    IWorkspaceCatalogFactory,
    IWorkspaceDashboards,
    IWorkspaceDatasetsService,
    IWorkspaceInsights,
    IWorkspaceMetadata,
    IWorkspacePermissionsFactory,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    NotSupported,
    IWorkspaceUsersQuery,
} from "@gooddata/sdk-backend-spi";
import { CustomExecutionFactory } from "./execution";
import { CustomBackendConfig, CustomBackendState } from "./config";

/**
 * @internal
 */
export class CustomWorkspace implements IAnalyticalWorkspace {
    constructor(
        public readonly workspace: string,
        private readonly config: CustomBackendConfig,
        private readonly state: CustomBackendState,
    ) {}

    public execution(): IExecutionFactory {
        return new CustomExecutionFactory(this.workspace, this.config, this.state);
    }

    //
    // Should implement
    //

    // used by attribute filters
    public elements(): IElementQueryFactory {
        throw new NotSupported("elements service is not supported");
    }

    // used in InsightView - implement if custom backend should support persisted insights
    public settings(): IWorkspaceSettingsService {
        throw new NotSupported("settings not supported");
    }

    // used in InsightView - implement if custom backend should support persisted insights
    public styling(): IWorkspaceStylingService {
        throw new NotSupported("styling is not supported");
    }

    //
    // Services for 'advanced' use cases - used in AD and KD.
    //
    public permissions(): IWorkspacePermissionsFactory {
        throw new NotSupported("permissions are not supported");
    }

    public catalog(): IWorkspaceCatalogFactory {
        throw new NotSupported("catalog is not supported");
    }

    public metadata(): IWorkspaceMetadata {
        throw new NotSupported("metadata is not supported");
    }

    public dataSets(): IWorkspaceDatasetsService {
        throw new NotSupported("data sets service is not supported");
    }

    public insights(): IWorkspaceInsights {
        throw new NotSupported("insights are not supported");
    }

    public dashboards(): IWorkspaceDashboards {
        throw new NotSupported("dashboards are not supported");
    }

    public users(): IWorkspaceUsersQuery {
        throw new NotSupported("users are not supported");
    }
}
