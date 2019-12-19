// (C) 2019 GoodData Corporation

import {
    IAnalyticalWorkspace,
    IElementQueryFactory,
    IExecutionFactory,
    IWorkspaceSettingsService,
    IWorkspaceMetadata,
    IWorkspaceStylingService,
    NotImplemented,
    IWorkspaceCatalogFactory,
    IWorkspaceDatasetsService,
    IWorkspacePermissionsFactory,
} from "@gooddata/sdk-backend-spi";
import { AxiosInstance } from "axios";
import { TigerExecution } from "./executionFactory";

export class TigerWorkspace implements IAnalyticalWorkspace {
    constructor(private readonly axios: AxiosInstance, public readonly workspace: string) {}

    public elements(): IElementQueryFactory {
        throw new NotImplemented("element query not yet implemented");
    }

    public execution(): IExecutionFactory {
        return new TigerExecution(this.axios, this.workspace);
    }

    public settings(): IWorkspaceSettingsService {
        throw new NotImplemented("feature flags query not yet implemented");
    }

    public metadata(): IWorkspaceMetadata {
        throw new NotImplemented("metadata service not yet implemented");
    }

    public styling(): IWorkspaceStylingService {
        throw new NotImplemented("styling service not yet implemented");
    }

    public catalog(): IWorkspaceCatalogFactory {
        throw new NotImplemented("catalog service not yet implemented");
    }

    public dataSets(): IWorkspaceDatasetsService {
        throw new NotImplemented("dataSets service not yet implemented");
    }

    public permissions(): IWorkspacePermissionsFactory {
        throw new NotImplemented("permissions service not yet implemented");
    }
}
