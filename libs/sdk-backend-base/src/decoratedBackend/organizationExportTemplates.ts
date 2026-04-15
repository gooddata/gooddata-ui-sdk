// (C) 2026 GoodData Corporation

import { type IOrganizationExportTemplatesService } from "@gooddata/sdk-backend-spi";
import { type IExportTemplate } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedOrganizationExportTemplatesService implements IOrganizationExportTemplatesService {
    protected constructor(protected readonly decorated: IOrganizationExportTemplatesService) {}

    public getExportTemplates(): Promise<IExportTemplate[]> {
        return this.decorated.getExportTemplates();
    }
}
