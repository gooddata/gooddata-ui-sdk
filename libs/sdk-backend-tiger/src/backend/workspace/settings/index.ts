// (C) 2019-2021 GoodData Corporation
import {
    // IWorkspaceSettings,
    IWorkspaceSettingsService,
    IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { DefaultUiSettings, DefaultUserSettings } from "../../uiSettings";

export class TigerWorkspaceSettings implements IWorkspaceSettingsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getSettings(): Promise<any> {
        return this.authCall(async (_client) => {
            const config = (
                await _client.organizationObjects.getEntityWorkspaces({
                    id: this.workspace,
                    metaInclude: ["config"],
                })
            ).data.data.meta?.config;
            console.log(config, "config");
            return {
                workspace: this.workspace,
                ...DefaultUiSettings,
                ...config,
            };
        });
    }

    public getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return this.authCall(async (_client, ctx) => {
            const principal = await ctx.getPrincipal();
            const settings: IUserWorkspaceSettings = {
                ...DefaultUserSettings,
                userId: principal.userId,
                workspace: this.workspace,
            };

            return settings;
        });
    }
}
