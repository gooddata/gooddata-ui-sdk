// (C) 2022 GoodData Corporation

import { XhrModule } from "./xhr.js";
import { GdcOrganization } from "@gooddata/api-model-bear";

export class OrganizationModule {
    constructor(private xhr: XhrModule) {}

    /**
     * Get current user's organization
     * @returns resolves with current user's organization
     */
    public getCurrentOrganization(): Promise<GdcOrganization.IOrganization> {
        return this.xhr.getParsed<GdcOrganization.IOrganization>("/gdc/app/organization/current");
    }
}
