// (C) 2021 GoodData Corporation

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
 * Organization descriptor contains details about the organization that services analytical workspaces.
 *
 * @public
 */
export interface IOrganizationDescriptor {
    id: string;
    title: string;
}
