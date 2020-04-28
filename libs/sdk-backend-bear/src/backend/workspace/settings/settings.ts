// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { BearAuthenticatedCallGuard } from "../../../types";
import { userLoginMd5FromAuthenticatedPrincipal } from "../../../utils/api";

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

    public queryForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return this.authCall(async (sdk, context) => {
            const workspaceFeatureFlags = await sdk.project.getProjectFeatureFlags(this.workspace);

            const userLoginMd5 = userLoginMd5FromAuthenticatedPrincipal(context.principal);
            // the getUserFeatureFlags returns all the feature flags (including the defaults)
            // so we have to filter only the user specific values so as not to use defaults everywhere
            const userFeatureFlags = await sdk.user.getUserFeatureFlags(userLoginMd5, ["user"]);

            return {
                userId: userLoginMd5,
                workspace: this.workspace,
                // the order is important here, user configs with the "user" source should override the workspace settings
                ...workspaceFeatureFlags,
                ...userFeatureFlags,
            };
        });
    }
}
