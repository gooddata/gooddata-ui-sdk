// (C) 2023-2025 GoodData Corporation
import {
    type IOrganization,
    type IOrganizationAutomationService,
    type IOrganizationLlmEndpointsService,
    type IOrganizationNotificationChannelService,
    type IOrganizationNotificationService,
    type IOrganizationPermissionService,
    type IOrganizationSettingsService,
    type IOrganizationStylingService,
    type IOrganizationUserService,
    type ISecuritySettingsService,
} from "@gooddata/sdk-backend-spi";
import { type IOrganizationDescriptor, type IOrganizationDescriptorUpdate } from "@gooddata/sdk-model";

import { type DecoratorFactories } from "./types.js";

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

    public updateDescriptor(descriptor: IOrganizationDescriptorUpdate): Promise<IOrganizationDescriptor> {
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

    public notificationChannels(): IOrganizationNotificationChannelService {
        return this.decorated.notificationChannels();
    }

    public llmEndpoints(): IOrganizationLlmEndpointsService {
        return this.decorated.llmEndpoints();
    }

    public notifications(): IOrganizationNotificationService {
        return this.decorated.notifications();
    }

    public automations(): IOrganizationAutomationService {
        return this.decorated.automations();
    }
}
