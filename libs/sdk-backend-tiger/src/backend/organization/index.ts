// (C) 2021 GoodData Corporation

import { IOrganization, IOrganizationDescriptor, ISecuritySettingsService } from "@gooddata/sdk-backend-spi";

import { SecuritySettingsService } from "./securitySettings";
import { TigerAuthenticatedCallGuard } from "../../types";

export class TigerOrganization implements IOrganization {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly organizationId: string,
    ) {}

    public async getDescriptor(): Promise<IOrganizationDescriptor> {
        // TODO: replace with direct call of TigerClient (once methods are generated from OpenAPI)
        const domainData = (await this.authCall((sdk) => sdk.axios.get("/api/entities/organization"))).data;
        return {
            id: this.organizationId,
            title: domainData.data.attributes.name,
        };
    }

    public securitySettings(): ISecuritySettingsService {
        return new SecuritySettingsService(this.organizationId);
    }
}
