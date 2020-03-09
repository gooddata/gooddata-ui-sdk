// (C) 2019-2020 GoodData Corporation
import { IWorkspaceSettings, IWorkspaceSettingsService } from "@gooddata/sdk-backend-spi";
import { BearAuthenticatedCallGuard } from "../../../types";

export class BearWorkspaceSettings implements IWorkspaceSettingsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public query(): Promise<IWorkspaceSettings> {
        return this.authCall(async sdk => {
            const flags = await sdk.project.getProjectFeatureFlags(this.workspace);

            return {
                workspace: this.workspace,
                ...flags,
            };
        });
    }
}
