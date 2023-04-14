// (C) 2022-2023 GoodData Corporation
import { IOrganizationSettingsService } from "@gooddata/sdk-backend-spi";
import { ISettings, IWhiteLabeling } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard, TigerSettingsType } from "../../types";
import { unwrapSettingContent } from "../../convertors/fromBackend/SettingsConverter";
import { TigerSettingsService, mapTypeToKey } from "../settings";

export class OrganizationSettingsService
    extends TigerSettingsService<ISettings>
    implements IOrganizationSettingsService
{
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {
        super();
    }

    public async setWhiteLabeling(whiteLabeling: IWhiteLabeling): Promise<void> {
        return this.setSetting("WHITE_LABELING", whiteLabeling);
    }

    public async getSettings(): Promise<ISettings> {
        const { data } = await this.authCall(async (client) =>
            client.entities.getAllEntitiesOrganizationSettings({}),
        );

        return data.data.reduce((result: ISettings, setting) => {
            return {
                ...result,
                [mapTypeToKey(setting.type, setting.id)]: unwrapSettingContent(setting.attributes?.content),
            };
        }, {});
    }

    protected async getSettingByType(type: TigerSettingsType) {
        return this.authCall((client) =>
            client.entities.getAllEntitiesOrganizationSettings({
                filter: `type==${type}`,
            }),
        );
    }

    protected async updateSetting(type: TigerSettingsType, id: string, content: any): Promise<any> {
        return this.authCall((client) =>
            client.entities.updateEntityOrganizationSettings({
                id,
                jsonApiOrganizationSettingInDocument: {
                    data: {
                        type: "organizationSetting",
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
        return this.authCall((client) =>
            client.entities.createEntityOrganizationSettings({
                jsonApiOrganizationSettingInDocument: {
                    data: {
                        type: "organizationSetting",
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
