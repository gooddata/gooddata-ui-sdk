// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { ActionsUtilities } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityDocumentTemplates,
    EntitiesApi_CreateEntityDocuments,
    EntitiesApi_CreateEntityPageTemplates,
    EntitiesApi_DeleteEntityDocumentTemplates,
    EntitiesApi_DeleteEntityDocuments,
    EntitiesApi_DeleteEntityPageTemplates,
    EntitiesApi_GetAllEntitiesDocumentTemplates,
    EntitiesApi_GetAllEntitiesDocuments,
    EntitiesApi_GetAllEntitiesPageTemplates,
    EntitiesApi_GetEntityDocumentTemplates,
    EntitiesApi_GetEntityDocuments,
    EntitiesApi_GetEntityPageTemplates,
    EntitiesApi_UpdateEntityDocumentTemplates,
    EntitiesApi_UpdateEntityDocuments,
    EntitiesApi_UpdateEntityPageTemplates,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ExportApi_CreateDocumentExport } from "@gooddata/api-client-tiger/endpoints/export";
import {
    type IExportResult,
    type IPublisherDocumentExportPdfOptions,
    type IWorkspacePublisherServiceV2,
    type PublisherDocumentListItemV2,
    isPublisherContentNotSupportedError,
} from "@gooddata/sdk-backend-spi";
import {
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherDocumentTemplateV2,
    type IPublisherDocumentV2,
    type IPublisherPageTemplateDefinitionV2,
    type IPublisherPageTemplateV2,
    type ObjRef,
} from "@gooddata/sdk-model";

import {
    convertPublisherDocumentListItemV2,
    convertPublisherDocumentTemplateV2,
    convertPublisherDocumentV2,
    convertPublisherPageTemplateV2,
} from "../../convertors/fromBackend/PublisherConverterV2.js";
import {
    convertPublisherDocumentTemplateToBackendV2,
    convertPublisherDocumentToBackendV2,
    convertPublisherPageTemplateToBackendV2,
} from "../../convertors/toBackend/PublisherConverterV2.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { objRefToIdentifier } from "../../utils/api.js";
import { handleExportResultPolling } from "../../utils/exportPolling.js";

const auditInclude = ["createdBy" as const, "modifiedBy" as const];

// The backend orders a never-modified object by its creation time.
const byLastChange = ["modifiedAt,desc"];

// One array per entity, flattened only after paging: loadAllPages stops at the first page shorter than
// the page size, so dropping an unreadable entity inside a page would end the paging early.
function readableOnly<T>(convert: () => T): T[] {
    try {
        return [convert()];
    } catch (error) {
        if (isPublisherContentNotSupportedError(error)) {
            return [];
        }
        throw error;
    }
}

export class TigerWorkspacePublisherServiceV2 implements IWorkspacePublisherServiceV2 {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    public getPageTemplates = async (): Promise<IPublisherPageTemplateV2[]> => {
        const perEntity = await this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesPageTemplates(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    metaInclude: ["origin"],
                    include: auditInclude,
                    page,
                    size,
                }).then((response) =>
                    response.data.data.map((template) =>
                        readableOnly(() => convertPublisherPageTemplateV2(template, response.data.included)),
                    ),
                ),
            ),
        );
        return perEntity.flat();
    };

    public getPageTemplate = async (ref: ObjRef): Promise<IPublisherPageTemplateV2> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityPageTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                metaInclude: ["origin"],
                include: auditInclude,
            });
            return convertPublisherPageTemplateV2(response.data.data, response.data.included);
        });
    };

    public createPageTemplate = async (
        template: IPublisherPageTemplateDefinitionV2,
    ): Promise<IPublisherPageTemplateV2> => {
        const attributes = convertPublisherPageTemplateToBackendV2(template);
        const id = this.newObjectId(template.ref);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityPageTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                include: auditInclude,
                jsonApiPublisherDocumentPageTemplatePostOptionalIdDocument: {
                    data: { type: "pageTemplate", id, attributes },
                },
            });
            return convertPublisherPageTemplateV2(response.data.data, response.data.included);
        });
    };

    public updatePageTemplate = async (
        template: IPublisherPageTemplateV2,
    ): Promise<IPublisherPageTemplateV2> => {
        const attributes = convertPublisherPageTemplateToBackendV2(template);
        const objectId = objRefToIdentifier(template.ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityPageTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                include: auditInclude,
                jsonApiPublisherDocumentPageTemplateInDocument: {
                    data: { type: "pageTemplate", id: objectId, attributes },
                },
            });
            return convertPublisherPageTemplateV2(response.data.data, response.data.included);
        });
    };

    public deletePageTemplate = async (ref: ObjRef): Promise<void> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityPageTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            }),
        );
    };

    public getDocumentTemplates = async (): Promise<IPublisherDocumentTemplateV2[]> => {
        const perEntity = await this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesDocumentTemplates(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    metaInclude: ["origin"],
                    include: auditInclude,
                    sort: byLastChange,
                    page,
                    size,
                }).then((response) =>
                    response.data.data.map((template) =>
                        readableOnly(() =>
                            convertPublisherDocumentTemplateV2(template, response.data.included),
                        ),
                    ),
                ),
            ),
        );
        return perEntity.flat();
    };

    public getDocumentTemplate = async (ref: ObjRef): Promise<IPublisherDocumentTemplateV2> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityDocumentTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                metaInclude: ["origin"],
                include: auditInclude,
            });
            return convertPublisherDocumentTemplateV2(response.data.data, response.data.included);
        });
    };

    public createDocumentTemplate = async (
        template: IPublisherDocumentTemplateDefinitionV2,
    ): Promise<IPublisherDocumentTemplateV2> => {
        const attributes = convertPublisherDocumentTemplateToBackendV2(template);
        const id = this.newObjectId(template.ref);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityDocumentTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                include: auditInclude,
                jsonApiPublisherDocumentTemplatePostOptionalIdDocument: {
                    data: { type: "documentTemplate", id, attributes },
                },
            });
            return convertPublisherDocumentTemplateV2(response.data.data, response.data.included);
        });
    };

    public updateDocumentTemplate = async (
        template: IPublisherDocumentTemplateV2,
    ): Promise<IPublisherDocumentTemplateV2> => {
        const attributes = convertPublisherDocumentTemplateToBackendV2(template);
        const objectId = objRefToIdentifier(template.ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityDocumentTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                include: auditInclude,
                jsonApiPublisherDocumentTemplateInDocument: {
                    data: { type: "documentTemplate", id: objectId, attributes },
                },
            });
            return convertPublisherDocumentTemplateV2(response.data.data, response.data.included);
        });
    };

    public deleteDocumentTemplate = async (ref: ObjRef): Promise<void> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityDocumentTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            }),
        );
    };

    public getDocuments = async (): Promise<PublisherDocumentListItemV2[]> => {
        return this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesDocuments(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    metaInclude: ["origin"],
                    include: auditInclude,
                    sort: byLastChange,
                    page,
                    size,
                }).then((response) =>
                    response.data.data.map((publisherDocument) =>
                        convertPublisherDocumentListItemV2(publisherDocument, response.data.included),
                    ),
                ),
            ),
        );
    };

    public getDocument = async (ref: ObjRef): Promise<IPublisherDocumentV2> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityDocuments(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                metaInclude: ["origin"],
                include: auditInclude,
            });
            return convertPublisherDocumentV2(response.data.data, response.data.included);
        });
    };

    public createDocument = async (
        publisherDocument: IPublisherDocumentDefinitionV2,
    ): Promise<IPublisherDocumentV2> => {
        const attributes = convertPublisherDocumentToBackendV2(publisherDocument);
        const id = this.newObjectId(publisherDocument.ref);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityDocuments(client.axios, client.basePath, {
                workspaceId: this.workspace,
                include: auditInclude,
                jsonApiPublisherDocumentPostOptionalIdDocument: {
                    data: { type: "document", id, attributes },
                },
            });
            return convertPublisherDocumentV2(response.data.data, response.data.included);
        });
    };

    public updateDocument = async (
        publisherDocument: IPublisherDocumentV2,
    ): Promise<IPublisherDocumentV2> => {
        const attributes = convertPublisherDocumentToBackendV2(publisherDocument);
        const objectId = objRefToIdentifier(publisherDocument.ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityDocuments(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                include: auditInclude,
                jsonApiPublisherDocumentInDocument: {
                    data: { type: "document", id: objectId, attributes },
                },
            });
            return convertPublisherDocumentV2(response.data.data, response.data.included);
        });
    };

    public deleteDocument = async (ref: ObjRef): Promise<void> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityDocuments(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            }),
        );
    };

    public exportDocumentToPdf = async (
        ref: ObjRef,
        options?: IPublisherDocumentExportPdfOptions,
    ): Promise<IExportResult> => {
        const documentId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const documentExport = await ExportApi_CreateDocumentExport(client.axios, client.basePath, {
                workspaceId: this.workspace,
                exportReportExportRequest: {
                    format: "PDF",
                    documentId,
                    fileName: options?.filename ?? "",
                },
            });

            return handleExportResultPolling(
                client,
                {
                    workspaceId: this.workspace,
                    exportId: documentExport.data.exportResult,
                },
                "getDocumentExport",
                options?.timeout,
            );
        });
    };

    private newObjectId(ref: ObjRef | undefined): string {
        return ref ? objRefToIdentifier(ref, this.authCall) : uuidv4();
    }
}
