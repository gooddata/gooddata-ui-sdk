// (C) 2019 GoodData Corporation

import {
    IAnalyticalWorkspace,
    IElementQueryFactory,
    IExecutionFactory,
    IFeatureFlagsQuery,
    IWorkspaceMetadata,
    IWorkspaceStyling,
    NotImplemented,
} from "@gooddata/sdk-backend-spi";
import { BearExecution } from "./executionFactory";
import { AuthenticatedSdkProvider } from "./commonTypes";
import { BearWorkspaceMetadata } from "./metadata";
import { BearWorkspaceStyling } from "./styling";

export class BearWorkspace implements IAnalyticalWorkspace {
    constructor(private readonly authSdk: AuthenticatedSdkProvider, public readonly workspace: string) {}

    public elements(): IElementQueryFactory {
        throw new NotImplemented("element query not yet implemented");
    }

    public execution(): IExecutionFactory {
        return new BearExecution(this.authSdk, this.workspace);
    }

    public featureFlags(): IFeatureFlagsQuery {
        throw new NotImplemented("feature flags query not yet implemented");
    }

    public metadata(): IWorkspaceMetadata {
        return new BearWorkspaceMetadata(this.authSdk, this.workspace);
    }

    public styling(): IWorkspaceStyling {
        return new BearWorkspaceStyling(this.authSdk, this.workspace);
    }
}
