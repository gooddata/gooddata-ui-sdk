// (C) 2022 GoodData Corporation

import { XhrModule } from "./xhr.js";
import { IOrganization } from "@gooddata/api-model-bear";

export class OrganizationModule {
    constructor(private xhr: XhrModule) {}

    /**
     * Get current user's organization
     * @returns resolves with current user's organization
     */
    public getCurrentOrganization(): Promise<IOrganization> {
        return this.xhr.getParsed<IOrganization>("/gdc/app/organization/current");
    }
}
