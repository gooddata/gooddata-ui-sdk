// (C) 2019 GoodData Corporation
import { IWorkspaceSettings, IWorkspaceSettingsService } from "@gooddata/sdk-backend-spi";
import { AuthenticatedCallGuard } from "./commonTypes";

export class BearWorkspaceSettings implements IWorkspaceSettingsService {
    constructor(private readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public query(): Promise<IWorkspaceSettings> {
        return this.authCall(async sdk => {
            const flags = await sdk.project.getFeatureFlags(this.workspace);

            return {
                workspace: this.workspace,
                ...flags,
            };
        });
    }
}
