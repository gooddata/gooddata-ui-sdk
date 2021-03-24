// (C) 2019-2021 GoodData Corporation
import {
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { DefaultUiSettings, DefaultUserSettings } from "../../uiSettings";

export class TigerWorkspaceSettings implements IWorkspaceSettingsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getSettings(): Promise<IWorkspaceSettings> {
        return this.authCall(async () => {
            return {
                workspace: this.workspace,
                ...DefaultUiSettings,
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
