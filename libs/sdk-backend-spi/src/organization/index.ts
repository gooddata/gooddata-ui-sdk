// (C) 2021-2025 GoodData Corporation
import { IOrganizationDescriptor, IOrganizationDescriptorUpdate } from "@gooddata/sdk-model";

import { IOrganizationLlmEndpointsService } from "./llmEndpoints/index.js";
import { IOrganizationNotificationChannelService } from "./notificationChannels/index.js";
import { IOrganizationNotificationService } from "./notifications/index.js";
import { IOrganizationPermissionService } from "./permissions/index.js";
import { ISecuritySettingsService } from "./securitySettings/index.js";
import { IOrganizationSettingsService } from "./settings/index.js";
import { IOrganizationStylingService } from "./styling/index.js";
import { IOrganizationUserService } from "./users/index.js";

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
