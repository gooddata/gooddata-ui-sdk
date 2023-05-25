// (C) 2019-2021 GoodData Corporation

import {
    IAnalyticalWorkspace,
    IExecutionFactory,
    IWorkspaceCatalogFactory,
    IWorkspaceDashboardsService,
    IWorkspaceDatasetsService,
    IWorkspaceInsightsService,
    IWorkspaceAttributesService,
    IWorkspaceMeasuresService,
    IWorkspaceFactsService,
    IWorkspacePermissionsService,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    NotSupported,
    IWorkspaceUsersQuery,
    IDateFilterConfigsQuery,
    IWorkspaceDescriptor,
    IWorkspaceUserGroupsQuery,
    IWorkspaceAccessControlService,
} from "@gooddata/sdk-backend-spi";
import { CustomExecutionFactory } from "./execution.js";
import { CustomBackendConfig, CustomBackendState } from "./config.js";

/**
 * @internal
 */
export class CustomWorkspace implements IAnalyticalWorkspace {
    constructor(
        public readonly workspace: string,
        private readonly config: CustomBackendConfig,
        private readonly state: CustomBackendState,
    ) {}

    public getDescriptor(): Promise<IWorkspaceDescriptor> {
        throw new NotSupported("getting workspace descriptor is not supported");
    }

    public getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined> {
        throw new NotSupported("getting parent workspace is not supported");
    }

    public execution(): IExecutionFactory {
        return new CustomExecutionFactory(this.workspace, this.config, this.state);
    }

    //
    // Should implement
    //

    // used by attribute filters
    public attributes(): IWorkspaceAttributesService {
        throw new NotSupported("attributes service is not supported");
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
    public permissions(): IWorkspacePermissionsService {
        throw new NotSupported("permissions are not supported");
    }

    public catalog(): IWorkspaceCatalogFactory {
        throw new NotSupported("catalog is not supported");
    }

    public measures(): IWorkspaceMeasuresService {
        throw new NotSupported("measures service is not supported");
    }

    public facts(): IWorkspaceFactsService {
        throw new NotSupported("measures service is not supported");
    }

    public datasets(): IWorkspaceDatasetsService {
        throw new NotSupported("data sets service is not supported");
    }

    public insights(): IWorkspaceInsightsService {
        throw new NotSupported("insights are not supported");
    }

    public dashboards(): IWorkspaceDashboardsService {
        throw new NotSupported("dashboards are not supported");
    }

    public users(): IWorkspaceUsersQuery {
        throw new NotSupported("users are not supported");
    }

    public dateFilterConfigs(): IDateFilterConfigsQuery {
        throw new NotSupported("dateFilterConfigs are not supported");
    }

    public userGroups(): IWorkspaceUserGroupsQuery {
        throw new NotSupported("user groups are not supported");
    }

    public accessControl(): IWorkspaceAccessControlService {
        throw new NotSupported("access control is not supported");
    }
}
