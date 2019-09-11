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
        throw new NotImplemented("metadata service not yet implemented");
    }

    public styling(): IWorkspaceStyling {
        throw new NotImplemented("styling service not yet implemented");
    }
}
