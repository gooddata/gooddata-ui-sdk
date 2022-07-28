// (C) 2022 GoodData Corporation

import { IOrganizationStylingService, NotSupported } from "@gooddata/sdk-backend-spi";
import { IThemeMetadataObject, ObjRef } from "@gooddata/sdk-model";

export class OrganizationStylingService implements IOrganizationStylingService {
    public async getThemes(): Promise<IThemeMetadataObject[]> {
        return Promise.reject(new NotSupported("Backend does not support theming on organization level"));
    }

    public async getActiveTheme(): Promise<ObjRef | undefined> {
        return Promise.reject(new NotSupported("Backend does not support theming on organization level"));
    }

    public async setActiveTheme(): Promise<void> {
        return Promise.reject(new NotSupported("Backend does not support theming on organization level"));
    }

    public async clearActiveTheme(): Promise<void> {
        return Promise.reject(new NotSupported("Backend does not support theming on organization level"));
    }
}
