// (C) 2020-2023 GoodData Corporation
import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import { v4 as uuidv4 } from "uuid";

import { convertApiError } from "../../utils/errorHandling.js";
import { TigerSettingsType } from "../../types/index.js";

export class TigerSettingsService<T> {
    constructor() {}

    public async getSettings(): Promise<T> {
        throw new UnexpectedError("This method needs to be implemented.");
    }

    public async setLocale(locale: string): Promise<void> {
        return this.setSetting("LOCALE", { value: locale });
    }

    protected async setSetting(type: TigerSettingsType, content: any): Promise<void> {
        try {
            const { data } = await this.getSettingByType(type);
            const settings = data.data;

            if (settings.length === 0) {
                const id = uuidv4();
                await this.createSetting(type, id, content);
            } else {
                const record = settings[0];
                await this.updateSetting(record.attributes?.type ?? type, record.id, content);
            }
        } catch (error: any) {
            throw convertApiError(error);
        }
    }

    protected async getSettingByType(_type: TigerSettingsType): Promise<any> {
        throw new UnexpectedError("This method needs to be implemented.");
    }

    protected async deleteSettingByType(_type: TigerSettingsType): Promise<any> {
        throw new UnexpectedError("This method needs to be implemented.");
    }

    protected async updateSetting(_type: TigerSettingsType, _id: string, _content: any): Promise<any> {
        throw new UnexpectedError("This method needs to be implemented.");
    }

    protected async createSetting(_type: TigerSettingsType, _id: string, _content: any): Promise<any> {
        throw new UnexpectedError("This method needs to be implemented.");
    }
}
