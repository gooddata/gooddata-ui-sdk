// (C) 2021 GoodData Corporation

import { IOrganization, ISecuritySettingsService } from "@gooddata/sdk-backend-spi";

import { SecuritySettingsService } from "./securitySettings";
import { BearAuthenticatedCallGuard } from "../../types/auth";

export class BearOrganization implements IOrganization {
    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        public readonly organizationId: string,
    ) {}

    public securitySettings(): ISecuritySettingsService {
        const organizationUri = `/gdc/domains/${this.organizationId}`;
        return new SecuritySettingsService(this.authCall, organizationUri);
    }
}
