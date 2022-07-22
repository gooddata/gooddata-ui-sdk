// (C) 2021-2022 GoodData Corporation

import {
    IOrganization,
    IOrganizations,
    IOrganizationStylingService,
    ISecuritySettingsService,
} from "@gooddata/sdk-backend-spi";
import { IOrganizationDescriptor } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import { SecuritySettingsService } from "./securitySettings";
import { BearAuthenticatedCallGuard } from "../../types/auth";
import { OrganizationStylingService } from "./styling";

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
}

export class BearOrganizations implements IOrganizations {
    constructor(private readonly authCall: BearAuthenticatedCallGuard) {}

    public async getCurrentOrganization(): Promise<IOrganization> {
        const bootstrap = await this.authCall((sdk) => sdk.user.getBootstrapResource());
        const organizationId = this.getDomainIdFromDomainUri(
            bootstrap.bootstrapResource.accountSetting.links?.domain,
        );
        return new BearOrganization(
            this.authCall,
            organizationId,
            bootstrap.bootstrapResource.settings?.organizationName,
        );
    }

    private getDomainIdFromDomainUri(domainUri: string | undefined): string {
        invariant(domainUri, "Current user has no domain uri");

        const lastIndexOfSlash = domainUri.lastIndexOf("/");
        return domainUri.substr(lastIndexOfSlash + 1);
    }
}
