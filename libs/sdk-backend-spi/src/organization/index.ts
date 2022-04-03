// (C) 2021-2022 GoodData Corporation
import { IOrganizationDescriptor } from "@gooddata/sdk-model";
import { ISecuritySettingsService } from "./securitySettings";

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
