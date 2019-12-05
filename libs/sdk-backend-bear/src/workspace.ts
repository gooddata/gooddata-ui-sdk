// (C) 2019 GoodData Corporation

import {
    IAnalyticalWorkspace,
    IElementQueryFactory,
    IExecutionFactory,
    IWorkspaceSettingsService,
    IWorkspaceMetadata,
    IWorkspaceStylingService,
    IWorkspaceDatasetsService,
    IWorkspaceCatalogFactory,
} from "@gooddata/sdk-backend-spi";
import { BearExecution } from "./executionFactory";
import { AuthenticatedCallGuard } from "./commonTypes";
import { BearWorkspaceMetadata } from "./metadata";
import { BearWorkspaceStyling } from "./styling";
import { BearWorkspaceElements } from "./elements";
import { BearWorkspaceCatalogFactory } from "./catalog/factory";
import { BearWorkspaceDataSets } from "./dataSets";
import { BearWorkspaceSettings } from "./settings";

export class BearWorkspace implements IAnalyticalWorkspace {
    constructor(private readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public elements(): IElementQueryFactory {
        return new BearWorkspaceElements(this.authCall, this.workspace);
    }

    public execution(): IExecutionFactory {
        return new BearExecution(this.authCall, this.workspace);
    }

    public settings(): IWorkspaceSettingsService {
        return new BearWorkspaceSettings(this.authCall, this.workspace);
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
}
