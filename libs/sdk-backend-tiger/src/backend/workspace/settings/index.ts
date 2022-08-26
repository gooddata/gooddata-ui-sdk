// (C) 2019-2022 GoodData Corporation
import {
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IUserWorkspaceSettings,
    isUnexpectedError,
} from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { TigerFeaturesService, pickContext } from "../../features";
import { DefaultUiSettings, DefaultUserSettings } from "../../uiSettings";
import { convertApiError } from "../../../utils/errorHandling";
import { unwrapSettingContent } from "../../../convertors/fromBackend/SettingsConverter";

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

    public async setLocale(locale: string): Promise<void> {
        return this.setSetting("locale", { value: locale });
    }

    private async setSetting(id: string, content: any): Promise<void> {
        // Currently it is necessary to check existence of required setting
        // since PUT does not support creation of non-existing setting.
        // It can be simplified to Update method once NAS-4291 is implemented
        try {
            await this.getSetting(id);
            await this.updateSetting(id, content);
        } catch (error: any) {
            if (isUnexpectedError(error)) {
                // if such settings is not defined
                await this.createSetting(id, content);
                return;
            }
            throw convertApiError(error);
        }
    }

    private async getSetting(id: string): Promise<any> {
        return this.authCall((client) =>
            client.entities.getEntityWorkspaceSettings({
                workspaceId: this.workspace,
                objectId: id,
            }),
        );
    }

    private async updateSetting(id: string, content: any): Promise<any> {
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
                        },
                    },
                },
            }),
        );
    }

    private async createSetting(id: string, content: any): Promise<any> {
        return this.authCall(async (client) =>
            client.entities.createEntityWorkspaceSettings({
                workspaceId: this.workspace,
                jsonApiWorkspaceSettingInDocument: {
                    data: {
                        type: "workspaceSetting",
                        id,
                        attributes: {
                            content,
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
