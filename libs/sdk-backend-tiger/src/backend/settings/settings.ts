// (C) 2020-2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import { type IAlertDefault, type IMetricFormatOverrideSetting, type ISeparators } from "@gooddata/sdk-model";

import { type TigerOrganizationSettingsType, type TigerSettingsType } from "../../types/index.js";

/**
 * Workspace setting types plus the types that exist only on the organization level.
 */
type TigerAnySettingsType = TigerSettingsType | TigerOrganizationSettingsType;
import { convertApiError } from "../../utils/errorHandling.js";

export class TigerSettingsService<T> {
    constructor() {}

    public getSettings(): Promise<T> {
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

    public async setAlertDefault(value: IAlertDefault): Promise<void> {
        return this.setSetting("ALERT", { value });
    }

    public async setMetricFormatOverride(override: IMetricFormatOverrideSetting): Promise<void> {
        return this.setSetting("METRIC_FORMAT_OVERRIDE", override);
    }

    protected async setSetting(type: TigerAnySettingsType, content: any): Promise<void> {
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

    protected getSettingByType(_type: TigerAnySettingsType): any {
        throw new UnexpectedError("This method needs to be implemented.");
    }

    protected deleteSettingByType(_type: TigerAnySettingsType): any {
        throw new UnexpectedError("This method needs to be implemented.");
    }

    protected updateSetting(_type: TigerAnySettingsType, _id: string, _content: any): any {
        throw new UnexpectedError("This method needs to be implemented.");
    }

    protected createSetting(_type: TigerAnySettingsType, _id: string, _content: any): any {
        throw new UnexpectedError("This method needs to be implemented.");
    }
}
