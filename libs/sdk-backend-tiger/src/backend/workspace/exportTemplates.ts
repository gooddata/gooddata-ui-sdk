// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { ActionsUtilities } from "@gooddata/api-client-tiger";
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
        // loadAllPages walks every page (a single request returns only the first).
        // `metaInclude: ["origin"]` populates each entity's origin meta so the converter can flag
        // templates inherited from a parent workspace (PARENT origin) as read-only.
        return this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesWorkspaceExportTemplates(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    metaInclude: ["origin"],
                    page,
                    size,
                }).then((response) => response.data.data.map(convertExportTemplate)),
            ),
        );
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
                    // Populate origin meta so the converter can flag a template inherited from a
                    // parent workspace / the organization, consistent with getExportTemplates.
                    metaInclude: ["origin"],
                },
            );
            return convertExportTemplate(response.data.data);
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
            return convertExportTemplate(response.data.data);
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
            return convertExportTemplate(response.data.data);
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
