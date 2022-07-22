// (C) 2019-2022 GoodData Corporation
import {
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";
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
        return getSettingsForCurrentUser(this.authCall, this.workspace);
    }
}

// Expose this wrapper to other SPI implementations
export function getSettingsForCurrentUser(
    authCall: TigerAuthenticatedCallGuard,
    workspace: string,
): Promise<IUserWorkspaceSettings> {
    return authCall(async (client) => {
        const {
            data: { meta: config, attributes },
        } = (
            await client.entities.getEntityWorkspaces({
                id: workspace,
                metaInclude: ["config"],
            })
        ).data;
        const profile = await client.profile.getCurrent();
        const features = await new TigerFeaturesService(authCall).getFeatures(
            profile,
            pickContext(attributes),
        );
        // TODO INE replace ANY by proper type once API client is fixed
        const { data }: any = await authCall(async (client) =>
            client.actions.workspaceResolveAllSettings({
                workspaceId: workspace,
            }),
        );
        const resolvedSettings: ISettings = data.reduce((result: ISettings, setting: any) => {
            return {
                ...result,
                [setting.id]: setting.content,
            };
        }, {});
        return {
            ...DefaultUserSettings,
            userId: profile.userId,
            workspace,
            ...config?.config,
            ...features,
            ...resolvedSettings,
        };
    });
}
