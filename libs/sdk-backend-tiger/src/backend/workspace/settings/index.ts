// (C) 2019-2022 GoodData Corporation
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
        return this.authCall(async (_client) => {
            const {
                data: { meta: config },
            } = (
                await _client.entities.getEntityWorkspaces({
                    id: this.workspace,
                    metaInclude: ["config"],
                })
            ).data;

            return {
                workspace: this.workspace,
                ...DefaultUiSettings,
                ...config?.config,
            };
        });
    }

    public getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return this.authCall(async (_client, ctx) => {
            const principal = await ctx.getPrincipal();
            const {
                data: { meta: config },
            } = (
                await _client.entities.getEntityWorkspaces({
                    id: this.workspace,
                    metaInclude: ["config"],
                })
            ).data;

            return {
                ...DefaultUserSettings,
                userId: principal.userId,
                workspace: this.workspace,
                ...config?.config,
            };
        });
    }
}
