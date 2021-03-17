// (C) 2021 GoodData Corporation

import {
    IOrganization,
    IOrganizationDescriptor,
    IOrganizations,
    ISecuritySettingsService,
} from "@gooddata/sdk-backend-spi";

import { SecuritySettingsService } from "./securitySettings";
import { TigerAuthenticatedCallGuard } from "../../types";

export class TigerOrganization implements IOrganization {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly organizationId: string,
        public readonly organizationName?: string,
    ) {}

    public async getDescriptor(): Promise<IOrganizationDescriptor> {
        // if we already have the data, no reason to download them again
        if (this.organizationName) {
            return {
                id: this.organizationId,
                title: this.organizationName,
            };
        }

        // TODO: replace with direct call of TigerClient (once methods are generated from OpenAPI)
        const organizationData = (
            await this.authCall((client) => client.axios.get("/api/entities/organization"))
        ).data;

        return {
            id: this.organizationId,
            title: organizationData.data.attributes.name,
        };
    }

    public securitySettings(): ISecuritySettingsService {
        return new SecuritySettingsService(this.organizationId);
    }
}

export class TigerOrganizations implements IOrganizations {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getCurrentOrganization(): Promise<IOrganization> {
        // TODO: replace with direct call of TigerClient (once methods are generated from OpenAPI)
        const organizationData = (
            await this.authCall((client) => client.axios.get("/api/entities/organization"))
        ).data;

        const organizationId = organizationData.data.id;
        const organizationName = organizationData.data.attributes.name;

        return new TigerOrganization(this.authCall, organizationId, organizationName);
    }
}
