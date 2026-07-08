// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import {
    EntitiesApi_CreateEntityWorkspaceExportTemplates,
    EntitiesApi_DeleteEntityWorkspaceExportTemplates,
    EntitiesApi_GetAllEntitiesWorkspaceExportTemplates,
    EntitiesApi_GetEntityWorkspaceExportTemplates,
    EntitiesApi_PatchEntityWorkspaceExportTemplates,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IWorkspaceExportTemplatesService } from "@gooddata/sdk-backend-spi";
import { type IExportTemplate, type IExportTemplateDefinition, type ObjRef } from "@gooddata/sdk-model";

import { convertExportTemplate } from "../../convertors/fromBackend/ExportTemplatesConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { objRefToIdentifier } from "../../utils/api.js";

export class WorkspaceExportTemplatesService implements IWorkspaceExportTemplatesService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    public getExportTemplates = async (): Promise<IExportTemplate[]> => {
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetAllEntitiesWorkspaceExportTemplates(
                client.axios,
                client.basePath,
                { workspaceId: this.workspace },
            );
            return response.data.data.map((item) => convertExportTemplate(item.id, item.attributes));
        });
    };

    public getExportTemplate = async (ref: ObjRef): Promise<IExportTemplate> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityWorkspaceExportTemplates(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId,
                },
            );
            return convertExportTemplate(response.data.data.id, response.data.data.attributes);
        });
    };

    public createExportTemplate = async (template: IExportTemplateDefinition): Promise<IExportTemplate> => {
        const id = uuidv4();
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityWorkspaceExportTemplates(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    jsonApiWorkspaceExportTemplatePostOptionalIdDocument: {
                        data: {
                            type: "workspaceExportTemplate",
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
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_PatchEntityWorkspaceExportTemplates(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId,
                    jsonApiWorkspaceExportTemplatePatchDocument: {
                        data: {
                            type: "workspaceExportTemplate",
                            id: objectId,
                            attributes: template,
                        },
                    },
                },
            );
            return convertExportTemplate(response.data.data.id, response.data.data.attributes);
        });
    };

    public deleteExportTemplate = async (ref: ObjRef): Promise<void> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        await this.authCall(async (client) => {
            await EntitiesApi_DeleteEntityWorkspaceExportTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            });
        });
    };
}
