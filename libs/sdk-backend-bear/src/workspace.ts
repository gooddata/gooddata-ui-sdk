// (C) 2019 GoodData Corporation

import {
    IAnalyticalWorkspace,
    IElementQueryFactory,
    IExecutionFactory,
    IWorkspaceSettingsService,
    IWorkspaceMetadata,
    IWorkspaceStylingService,
    NotImplemented,
} from "@gooddata/sdk-backend-spi";
import { BearExecution } from "./executionFactory";
import { AuthenticatedCallGuard } from "./commonTypes";
import { BearWorkspaceMetadata } from "./metadata";
import { BearWorkspaceStyling } from "./styling";
import { BearWorkspaceElements } from "./elements";

export class BearWorkspace implements IAnalyticalWorkspace {
    constructor(private readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public elements(): IElementQueryFactory {
        return new BearWorkspaceElements(this.authCall, this.workspace);
    }

    public execution(): IExecutionFactory {
        return new BearExecution(this.authCall, this.workspace);
    }

    public settings(): IWorkspaceSettingsService {
        throw new NotImplemented("feature flags query not yet implemented");
    }

    public metadata(): IWorkspaceMetadata {
        return new BearWorkspaceMetadata(this.authCall, this.workspace);
    }

    public styling(): IWorkspaceStylingService {
        return new BearWorkspaceStyling(this.authCall, this.workspace);
    }
}
