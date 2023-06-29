// (C) 2021-2022 GoodData Corporation

import {
    IOrganization,
    IOrganizations,
    IOrganizationSettingsService,
    IOrganizationStylingService,
    ISecuritySettingsService,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { IOrganizationDescriptor } from "@gooddata/sdk-model";

import { SecuritySettingsService } from "./securitySettings.js";
import { BearAuthenticatedCallGuard } from "../../types/auth.js";
import { OrganizationStylingService } from "./styling.js";

export class BearOrganization implements IOrganization {
    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        public readonly organizationId: string,
        private readonly organizationName?: string,
    ) {}

    public async getDescriptor(): Promise<IOrganizationDescriptor> {
        // if we already have the data, no reason to download them again
        if (this.organizationName) {
            return {
                id: this.organizationId,
                title: this.organizationName,
            };
        }

        const accountInfo = await this.authCall((sdk) => sdk.user.getAccountInfo());
        return {
            id: this.organizationId,
            title: accountInfo.organizationName,
        };
    }

    public securitySettings(): ISecuritySettingsService {
        const organizationUri = `/gdc/domains/${this.organizationId}`;
        return new SecuritySettingsService(this.authCall, organizationUri);
    }

    public styling(): IOrganizationStylingService {
        return new OrganizationStylingService();
    }

    public settings(): IOrganizationSettingsService {
        throw new NotSupported("Backend does not support organization settings service");
    }
}

export class BearOrganizations implements IOrganizations {
    constructor(private readonly authCall: BearAuthenticatedCallGuard) {}

    public async getCurrentOrganization(): Promise<IOrganization> {
        const {
            organization: { id, name },
        } = await this.authCall((sdk) => sdk.organization.getCurrentOrganization());
        return new BearOrganization(this.authCall, id, name);
    }
}
