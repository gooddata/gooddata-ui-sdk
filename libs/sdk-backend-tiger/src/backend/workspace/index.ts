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
    IWorkspaceDashboards,
    NotSupported,
    IWorkspaceUsersQuery,
    IWorkspaceDateFilterConfigsQuery,
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
import { DateValueFormatter } from "../../dateFormatting/dateValueFormatter";

export class TigerWorkspace implements IAnalyticalWorkspace {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
        private readonly dateValueFormatter: DateValueFormatter,
    ) {}

    public elements(): IElementQueryFactory {
        return new TigerWorkspaceElements(this.authCall, this.workspace);
    }

    public execution(): IExecutionFactory {
        return new TigerExecution(this.authCall, this.workspace, this.dateValueFormatter);
    }

    public settings(): IWorkspaceSettingsService {
        return new TigerWorkspaceSettings(this.authCall, this.workspace);
    }

    public insights(): IWorkspaceInsights {
        return new TigerWorkspaceInsights(this.authCall, this.workspace);
    }

    public dashboards(): IWorkspaceDashboards {
        throw new NotSupported("Not supported");
    }

    public metadata(): IWorkspaceMetadata {
        return new TigerWorkspaceMetadata(this.authCall, this.workspace);
    }

    public styling(): IWorkspaceStylingService {
        return new TigerWorkspaceStyling(this.authCall, this.workspace);
    }

    public catalog(): IWorkspaceCatalogFactory {
        return new TigerWorkspaceCatalogFactory(this.authCall, this.workspace);
    }

    public dataSets(): IWorkspaceDatasetsService {
        return new TigerWorkspaceDataSets(this.authCall, this.workspace);
    }

    public permissions(): IWorkspacePermissionsFactory {
        return new TigerWorkspacePermissionsFactory(this.authCall, this.workspace);
    }

    public users(): IWorkspaceUsersQuery {
        throw new NotSupported("Not supported");
    }
    public dateFilterConfigs(): IWorkspaceDateFilterConfigsQuery {
        throw new NotSupported("not supported");
    }
}
