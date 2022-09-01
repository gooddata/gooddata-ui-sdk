// (C) 2022 GoodData Corporation
import { IOrganizationSettingsService, isUnexpectedError } from "@gooddata/sdk-backend-spi";
import { IWhiteLabeling } from "@gooddata/sdk-model";
import { convertApiError } from "../../utils/errorHandling";
import { TigerAuthenticatedCallGuard } from "../../types";

export class OrganizationSettingsService implements IOrganizationSettingsService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public async setWhiteLabeling(whiteLabeling: IWhiteLabeling): Promise<void> {
        return this.setSetting("whiteLabeling", whiteLabeling);
    }

    public async setLocale(locale: string): Promise<void> {
        return this.setSetting("locale", { value: locale });
    }

    private async setSetting(id: string, content: any): Promise<any> {
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
            client.entities.getEntityOrganizationSettings({
                id,
            }),
        );
    }

    private async updateSetting(id: string, content: any): Promise<any> {
        return this.authCall((client) =>
            client.entities.updateEntityOrganizationSettings({
                id,
                jsonApiOrganizationSettingInDocument: {
                    data: {
                        type: "organizationSetting",
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
        return this.authCall((client) =>
            client.entities.createEntityOrganizationSettings({
                jsonApiOrganizationSettingInDocument: {
                    data: {
                        type: "organizationSetting",
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
