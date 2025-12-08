// (C) 2020-2025 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import { IAlertDefault, IMetricFormatOverrideSetting, ISeparators } from "@gooddata/sdk-model";

import { TigerSettingsType } from "../../types/index.js";
import { convertApiError } from "../../utils/errorHandling.js";

export class TigerSettingsService<T> {
    constructor() {}

    public async getSettings(): Promise<T> {
        throw new UnexpectedError("This method needs to be implemented.");
    }

    public async setLocale(locale: string): Promise<void> {
        return this.setSetting("LOCALE", { value: locale });
    }

    public async setMetadataLocale(locale: string): Promise<void> {
        return this.setSetting("METADATA_LOCALE", { value: locale });
    }

    public async setFormatLocale(locale: string): Promise<void> {
        return this.setSetting("FORMAT_LOCALE", { value: locale });
    }

    public async setSeparators(separators: ISeparators): Promise<void> {
        return this.setSetting("SEPARATORS", separators);
    }

    public async setTheme(themeId: string): Promise<void> {
        return this.setSetting("ACTIVE_THEME", { value: themeId });
    }

    public async setAlertDefault(value: IAlertDefault): Promise<void> {
        return this.setSetting("ALERT", { value });
    }

    public async setColorPalette(colorPaletteId: string): Promise<void> {
        return this.setSetting("ACTIVE_COLOR_PALETTE", { value: colorPaletteId });
    }

    public async setMetricFormatOverride(override: IMetricFormatOverrideSetting): Promise<void> {
        return this.setSetting("METRIC_FORMAT_OVERRIDE", override);
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
