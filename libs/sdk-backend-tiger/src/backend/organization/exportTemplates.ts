// (C) 2026 GoodData Corporation

import { ExportTemplatesApi_GetAllEntitiesExportTemplates } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IOrganizationExportTemplatesService } from "@gooddata/sdk-backend-spi";
import { type IExportTemplate } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class OrganizationExportTemplatesService implements IOrganizationExportTemplatesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public getExportTemplates = async (): Promise<IExportTemplate[]> => {
        return this.authCall(async (client) => {
            const response = await ExportTemplatesApi_GetAllEntitiesExportTemplates(
                client.axios,
                client.basePath,
                {},
            );
            return response.data.data.map((item) => ({
                id: item.id,
                name: item.attributes.name,
            }));
        });
    };
}
