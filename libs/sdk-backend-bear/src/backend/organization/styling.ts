// (C) 2022 GoodData Corporation

import { IOrganizationStylingService, NotSupported } from "@gooddata/sdk-backend-spi";

export class OrganizationStylingService implements IOrganizationStylingService {
    public async getThemes() {
        return Promise.reject(new NotSupported("Backend does not support theming on organization level"));
    }

    public async setActiveTheme(): Promise<void> {
        return Promise.reject(new NotSupported("Backend does not support theming on organization level"));
    }
}
