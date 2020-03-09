// (C) 2019-2020 GoodData Corporation

import {
    IAnalyticalWorkspace,
    IElementQueryFactory,
    IExecutionFactory,
    IWorkspaceSettingsService,
    IWorkspaceMetadata,
    IWorkspaceStylingService,
    IWorkspaceCatalogFactory,
    IWorkspacePermissionsFactory,
    IWorkspaceInsights,
    IWorkspaceDatasetsService,
} from "@gooddata/sdk-backend-spi";
import { TigerExecution } from "./execution/executionFactory";
import { TigerWorkspaceCatalogFactory } from "./catalog/factory";
import { TigerWorkspaceDataSets } from "./datasets";
import { TigerAuthenticatedCallGuard } from "../../types";
import { TigerWorkspaceElements } from "./elements";
import { TigerWorkspaceSettings } from "./settings";
import { TigerWorkspaceMetadata } from "./metadata";
import { TigerWorkspacePermissionsFactory } from "./permissions";
import { TigerWorkspaceStyling } from "./styling";
import { TigerWorkspaceInsights } from "./insights";

export class TigerWorkspace implements IAnalyticalWorkspace {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public elements(): IElementQueryFactory {
        return new TigerWorkspaceElements(this.authCall, this.workspace);
    }

    public execution(): IExecutionFactory {
        return new TigerExecution(this.authCall, this.workspace);
    }

    public settings(): IWorkspaceSettingsService {
        return new TigerWorkspaceSettings(this.authCall, this.workspace);
    }

    public insights(): IWorkspaceInsights {
        return new TigerWorkspaceInsights(this.authCall, this.workspace);
    }

    public metadata(): IWorkspaceMetadata {
        return new TigerWorkspaceMetadata(this.authCall, this.workspace);
    }

    public styling(): IWorkspaceStylingService {
        throw new TigerWorkspaceStyling(this.authCall, this.workspace);
    }

    public catalog(): IWorkspaceCatalogFactory {
        return new TigerWorkspaceCatalogFactory(this.authCall, this.workspace);
    }

    public dataSets(): IWorkspaceDatasetsService {
        return new TigerWorkspaceDataSets(this.authCall, this.workspace);
    }

    public permissions(): IWorkspacePermissionsFactory {
        throw new TigerWorkspacePermissionsFactory(this.authCall, this.workspace);
    }
}
