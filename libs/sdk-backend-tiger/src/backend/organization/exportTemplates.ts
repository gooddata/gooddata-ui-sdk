// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import {
    ExportTemplatesApi_CreateEntityExportTemplates,
    ExportTemplatesApi_DeleteEntityExportTemplates,
    ExportTemplatesApi_GetAllEntitiesExportTemplates,
    ExportTemplatesApi_GetEntityExportTemplates,
    ExportTemplatesApi_PatchEntityExportTemplates,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IOrganizationExportTemplatesService } from "@gooddata/sdk-backend-spi";
import { type IExportTemplate, type IExportTemplateDefinition, type ObjRef } from "@gooddata/sdk-model";

import { convertExportTemplate } from "../../convertors/fromBackend/ExportTemplatesConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { objRefToIdentifier } from "../../utils/api.js";

export class OrganizationExportTemplatesService implements IOrganizationExportTemplatesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public getExportTemplates = async (): Promise<IExportTemplate[]> => {
        return this.authCall(async (client) => {
            const response = await ExportTemplatesApi_GetAllEntitiesExportTemplates(
                client.axios,
                client.basePath,
                {},
            );
            return response.data.data.map((item) => convertExportTemplate(item.id, item.attributes));
        });
    };

    public getExportTemplate = async (ref: ObjRef): Promise<IExportTemplate> => {
        const id = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await ExportTemplatesApi_GetEntityExportTemplates(
                client.axios,
                client.basePath,
                {
                    id,
                },
            );
            return convertExportTemplate(response.data.data.id, response.data.data.attributes);
        });
    };

    public createExportTemplate = async (template: IExportTemplateDefinition): Promise<IExportTemplate> => {
        const id = uuidv4();
        return this.authCall(async (client) => {
            const response = await ExportTemplatesApi_CreateEntityExportTemplates(
                client.axios,
                client.basePath,
                {
                    jsonApiExportTemplatePostOptionalIdDocument: {
                        data: {
                            type: "exportTemplate",
                            id,
                            attributes: template,
                        },
                    },
                },
            );
            return convertExportTemplate(response.data.data.id, response.data.data.attributes);
        });
    };

    public patchExportTemplate = async (
        ref: ObjRef,
        template: Partial<IExportTemplateDefinition>,
    ): Promise<IExportTemplate> => {
        const id = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await ExportTemplatesApi_PatchEntityExportTemplates(
                client.axios,
                client.basePath,
                {
                    id,
                    jsonApiExportTemplatePatchDocument: {
                        data: {
                            type: "exportTemplate",
                            id,
                            attributes: template,
                        },
                    },
                },
            );
            return convertExportTemplate(response.data.data.id, response.data.data.attributes);
        });
    };

    public deleteExportTemplate = async (ref: ObjRef): Promise<void> => {
        const id = objRefToIdentifier(ref, this.authCall);
        await this.authCall(async (client) => {
            await ExportTemplatesApi_DeleteEntityExportTemplates(client.axios, client.basePath, { id });
        });
    };
}
