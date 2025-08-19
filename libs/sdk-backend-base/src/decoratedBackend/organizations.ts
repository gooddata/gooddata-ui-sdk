// (C) 2023-2025 GoodData Corporation
import { IOrganization, IOrganizations } from "@gooddata/sdk-backend-spi";

import { OrganizationDecorator } from "./organization.js";
import { DecoratorFactories } from "./types.js";
export class OrganizationsDecorator implements IOrganizations {
    constructor(
        private readonly decorated: IOrganizations,
        private readonly factories: DecoratorFactories,
    ) {}

    public async getCurrentOrganization(): Promise<IOrganization> {
        const fromDecorated = await this.decorated.getCurrentOrganization();
        return new OrganizationDecorator(fromDecorated, this.factories);
    }
}
