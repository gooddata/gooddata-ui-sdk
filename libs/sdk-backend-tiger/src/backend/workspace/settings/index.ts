// (C) 2019-2022 GoodData Corporation
import {
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { TigerFeaturesService, pickContext } from "../../features";
import { DefaultUiSettings, DefaultUserSettings } from "../../uiSettings";

export class TigerWorkspaceSettings implements IWorkspaceSettingsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getSettings(): Promise<IWorkspaceSettings> {
        return this.authCall(async (client) => {
            const {
                data: { meta: config },
            } = (
                await client.entities.getEntityWorkspaces({
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
        return this.authCall(async (client) => {
            const {
                data: { meta: config, attributes },
            } = (
                await client.entities.getEntityWorkspaces({
                    id: this.workspace,
                    metaInclude: ["config"],
                })
            ).data;
            const profile = await client.profile.getCurrent();
            const features = await new TigerFeaturesService(this.authCall).getFeatures(
                profile,
                pickContext(attributes),
            );

            return {
                ...DefaultUserSettings,
                userId: profile.userId,
                workspace: this.workspace,
                ...config?.config,
                ...features,
            };
        });
    }
}
