// (C) 2023-2024 GoodData Corporation
import {
    IOrganization,
    ISecuritySettingsService,
    IOrganizationStylingService,
    IOrganizationSettingsService,
    IOrganizationUserService,
    IOrganizationPermissionService,
} from "@gooddata/sdk-backend-spi";
import { IOrganizationDescriptor, IOrganizationDescriptorUpdate } from "@gooddata/sdk-model";
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

    public getDescriptor(includeAdditionalDetails?: boolean): Promise<IOrganizationDescriptor> {
        return this.decorated.getDescriptor(includeAdditionalDetails);
    }

    public updateDescriptor(descriptor: IOrganizationDescriptorUpdate): Promise<void> {
        return this.decorated.updateDescriptor(descriptor);
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

    public users(): IOrganizationUserService {
        return this.decorated.users();
    }

    public permissions(): IOrganizationPermissionService {
        return this.decorated.permissions();
    }
}
