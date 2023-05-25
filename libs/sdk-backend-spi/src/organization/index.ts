// (C) 2021-2023 GoodData Corporation
import { IOrganizationDescriptor } from "@gooddata/sdk-model";
import { IOrganizationSettingsService } from "./settings/index.js";
import { ISecuritySettingsService } from "./securitySettings/index.js";
import { IOrganizationStylingService } from "./styling/index.js";

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
     */
    getDescriptor(): Promise<IOrganizationDescriptor>;

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
