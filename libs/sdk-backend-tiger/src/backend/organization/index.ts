// (C) 2021-2022 GoodData Corporation

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
        const organizationData: {
            organizationName: string;
            organizationId: string;
        } = await this.authCall((client) => client.axios.get("/api/profile"));

        return {
            id: organizationData.organizationId,
            title: organizationData.organizationName,
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
        const organizationData: {
            organizationName: string;
            organizationId: string;
        } = await this.authCall((client) => client.axios.get("/api/profile"));

        const organizationId = organizationData.organizationId;
        const organizationName = organizationData.organizationName;

        return new TigerOrganization(this.authCall, organizationId, organizationName);
    }
}
