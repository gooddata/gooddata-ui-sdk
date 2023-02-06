// (C) 2019-2023 GoodData Corporation
import {
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard, TigerSettingsType } from "../../../types";
import { TigerFeaturesService, pickContext } from "../../features";
import { DefaultUiSettings, DefaultUserSettings } from "../../uiSettings";
import { unwrapSettingContent } from "../../../convertors/fromBackend/SettingsConverter";
import { TigerSettingsService } from "../../settings";

export class TigerWorkspaceSettings
    extends TigerSettingsService<IWorkspaceSettings>
    implements IWorkspaceSettingsService
{
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {
        super();
    }

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

    protected async getSettingByType(type: TigerSettingsType) {
        return this.authCall((client) =>
            client.entities.getAllEntitiesWorkspaceSettings({
                workspaceId: this.workspace,
                origin: "NATIVE",
                filter: `type==${type}`,
            }),
        );
    }

    protected async updateSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall(async (client) =>
            client.entities.updateEntityWorkspaceSettings({
                workspaceId: this.workspace,
                objectId: id,
                jsonApiWorkspaceSettingInDocument: {
                    data: {
                        type: "workspaceSetting",
                        id,
                        attributes: {
                            content,
                            type,
                        },
                    },
                },
            }),
        );
    }

    protected async createSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall(async (client) =>
            client.entities.createEntityWorkspaceSettings({
                workspaceId: this.workspace,
                jsonApiWorkspaceSettingInDocument: {
                    data: {
                        type: "workspaceSetting",
                        id,
                        attributes: {
                            content,
                            type,
                        },
                    },
                },
            }),
        );
    }
}

/**
 * @internal
 */
async function resolveSettings(authCall: TigerAuthenticatedCallGuard, workspace: string): Promise<ISettings> {
    const { data } = await authCall(async (client) =>
        client.actions.workspaceResolveAllSettings({
            workspaceId: workspace,
        }),
    );

    return data.reduce((result: ISettings, setting) => {
        return {
            ...result,
            [setting.id]: unwrapSettingContent(setting.content),
        };
    }, {});
}

/**
 * Expose this wrapper to other SPI implementations
 *
 * @internal
 */
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

        const resolvedSettings: ISettings = await resolveSettings(authCall, workspace);

        const profile = await client.profile.getCurrent();
        const features = await new TigerFeaturesService(authCall).getFeatures(
            profile,
            pickContext(attributes),
        );

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
