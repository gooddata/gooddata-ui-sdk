// (C) 2021 GoodData Corporation

import { ISecuritySettingsService } from "./securitySettings";

/**
 * Represents an organization that services analytical workspaces.
 *
 * @public
 */
export interface IOrganization {
    readonly organizationId: string;

    /**
     * Returns service that can be used to query and update organization security settings.
     */
    securitySettings(): ISecuritySettingsService;
}
