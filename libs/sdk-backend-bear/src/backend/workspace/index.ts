// (C) 2019-2020 GoodData Corporation

import {
    IAnalyticalWorkspace,
    IElementQueryFactory,
    IExecutionFactory,
    IWorkspaceSettingsService,
    IWorkspaceMetadata,
    IWorkspaceStylingService,
    IWorkspaceCatalogFactory,
    IWorkspaceDatasetsService,
    IWorkspacePermissionsFactory,
    IWorkspaceInsights,
    IWorkspaceDashboards,
    IWorkspaceUsersQuery,
    IWorkspaceDateFilterConfigsQuery,
} from "@gooddata/sdk-backend-spi";
import { BearExecution } from "./execution/executionFactory";
import { BearWorkspaceMetadata } from "./metadata";
import { BearWorkspaceStyling } from "./styling/styling";
import { BearWorkspaceElements } from "./elements/elements";
import { BearWorkspaceCatalogFactory } from "./catalog/factory";
import { BearWorkspaceSettings } from "./settings/settings";
import { BearWorkspacePermissionsFactory } from "./permissions/permissions";
import { BearWorkspaceInsights } from "./insights";
import { BearWorkspaceDataSets } from "./datasets";
import { BearWorkspaceDashboards } from "./dashboards";
import { BearAuthenticatedCallGuard } from "../../types";
import { BearWorkspaceUsersQuery } from "./users";
import { BearWorkspaceDateFilterConfigsQuery } from "./dateFilterConfigs";

export class BearWorkspace implements IAnalyticalWorkspace {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public elements(): IElementQueryFactory {
        return new BearWorkspaceElements(this.authCall, this.workspace);
    }

    public execution(): IExecutionFactory {
        return new BearExecution(this.authCall, this.workspace);
    }

    public settings(): IWorkspaceSettingsService {
        return new BearWorkspaceSettings(this.authCall, this.workspace);
    }

    public insights(): IWorkspaceInsights {
        return new BearWorkspaceInsights(this.authCall, this.workspace);
    }

    public dashboards(): IWorkspaceDashboards {
        return new BearWorkspaceDashboards(this.authCall, this.workspace);
    }

    public metadata(): IWorkspaceMetadata {
        return new BearWorkspaceMetadata(this.authCall, this.workspace);
    }

    public styling(): IWorkspaceStylingService {
        return new BearWorkspaceStyling(this.authCall, this.workspace);
    }

    public catalog(): IWorkspaceCatalogFactory {
        return new BearWorkspaceCatalogFactory(this.authCall, this.workspace);
    }

    public dataSets(): IWorkspaceDatasetsService {
        return new BearWorkspaceDataSets(this.authCall, this.workspace);
    }

    public permissions(): IWorkspacePermissionsFactory {
        return new BearWorkspacePermissionsFactory(this.authCall, this.workspace);
    }

    public users(): IWorkspaceUsersQuery {
        return new BearWorkspaceUsersQuery(this.authCall, this.workspace);
    }

    public dateFilterConfigs(): IWorkspaceDateFilterConfigsQuery {
        return new BearWorkspaceDateFilterConfigsQuery(this.authCall, this.workspace);
    }
}
