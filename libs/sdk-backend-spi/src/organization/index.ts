// (C) 2021-2025 GoodData Corporation
import { type IOrganizationDescriptor, type IOrganizationDescriptorUpdate } from "@gooddata/sdk-model";

import { type IOrganizationAutomationService } from "./automations/index.js";
import { type IOrganizationLlmEndpointsService } from "./llmEndpoints/index.js";
import { type IOrganizationNotificationChannelService } from "./notificationChannels/index.js";
import { type IOrganizationNotificationService } from "./notifications/index.js";
import { type IOrganizationPermissionService } from "./permissions/index.js";
import { type ISecuritySettingsService } from "./securitySettings/index.js";
import { type IOrganizationSettingsService } from "./settings/index.js";
import { type IOrganizationStylingService } from "./styling/index.js";
import { type IOrganizationUserService } from "./users/index.js";

/**
 * Represents an organization that services analytical workspaces.
 *
 * @public
 */
export interface IOrganization {
    /**
     * ID of organization.
     */
    readonly organizationId: string;

    /**
     * Returns details about the organization.
     *
     * @param includeAdditionalDetails - include additional details such as bootstrap user and user group.
     */
    getDescriptor(includeAdditionalDetails?: boolean): Promise<IOrganizationDescriptor>;

    /**
     * Updates details about the organization.
     *
     * @param descriptor - properties to update
     */
    updateDescriptor(descriptor: IOrganizationDescriptorUpdate): Promise<IOrganizationDescriptor>;

    /**
     * Returns service that can be used to query and update organization security settings.
     */
    securitySettings(): ISecuritySettingsService;

    /**
     * Returns service that can be used to query and update organization styling.
     */
    styling(): IOrganizationStylingService;

    /**
     * Returns current organization settings.
     */
    settings(): IOrganizationSettingsService;

    /**
     * Returns service that can be used to query and update organization users and user groups.
     */
    users(): IOrganizationUserService;

    /**
     * Returns service that can be used to query and manage permissions to organization.
     */
    permissions(): IOrganizationPermissionService;

    /**
     * Returns service that can be used to query and manage organization notification channels.
     */
    notificationChannels(): IOrganizationNotificationChannelService;

    /**
     * Returns service that can be used to query and manage organization LLM endpoints.
     */
    llmEndpoints(): IOrganizationLlmEndpointsService;

    /**
     * Returns service that can be used to query and manage organization notifications.
     */
    notifications(): IOrganizationNotificationService;

    /**
     * Returns service that can be used to query and manage automations across all workspaces in the organization
     * for centralized automation management.
     *
     * @alpha
     */
    automations(): IOrganizationAutomationService;
}

/**
 * Provides functions to obtain {@link IOrganization} instances
 *
 * @public
 */
export interface IOrganizations {
    /**
     * Gets the organization the current user is part of.
     */
    getCurrentOrganization(): Promise<IOrganization>;
}
