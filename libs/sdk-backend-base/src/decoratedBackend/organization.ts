// (C) 2023 GoodData Corporation
import {
    IOrganization,
    ISecuritySettingsService,
    IOrganizationStylingService,
    IOrganizationSettingsService,
} from "@gooddata/sdk-backend-spi";
import { IOrganizationDescriptor } from "@gooddata/sdk-model";
import { DecoratorFactories } from "./types.js";

export class OrganizationDecorator implements IOrganization {
    readonly organizationId: string;
    private decorated: IOrganization;
    private readonly factories: DecoratorFactories;

    constructor(decorated: IOrganization, factories: DecoratorFactories) {
        this.decorated = decorated;
        this.factories = factories;
        this.organizationId = decorated.organizationId;
    }

    public getDescriptor(): Promise<IOrganizationDescriptor> {
        return this.decorated.getDescriptor();
    }

    public securitySettings(): ISecuritySettingsService {
        const { securitySettings } = this.factories;

        if (securitySettings) {
            return securitySettings(this.decorated.securitySettings());
        }

        return this.decorated.securitySettings();
    }

    public styling(): IOrganizationStylingService {
        return this.decorated.styling();
    }

    public settings(): IOrganizationSettingsService {
        return this.decorated.settings();
    }
}
