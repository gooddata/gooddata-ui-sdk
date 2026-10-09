// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { ActionsUtilities } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityReportPageLayouts,
    EntitiesApi_CreateEntityReportTemplates,
    EntitiesApi_CreateEntityReports,
    EntitiesApi_DeleteEntityReportPageLayouts,
    EntitiesApi_DeleteEntityReportTemplates,
    EntitiesApi_DeleteEntityReports,
    EntitiesApi_GetAllEntitiesReportPageLayouts,
    EntitiesApi_GetAllEntitiesReportTemplates,
    EntitiesApi_GetAllEntitiesReports,
    EntitiesApi_GetEntityReportPageLayouts,
    EntitiesApi_GetEntityReportTemplates,
    EntitiesApi_GetEntityReports,
    EntitiesApi_UpdateEntityReportPageLayouts,
    EntitiesApi_UpdateEntityReportTemplates,
    EntitiesApi_UpdateEntityReports,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ExportApi_CreateReportExport } from "@gooddata/api-client-tiger/endpoints/export";
import {
    type IExportResult,
    type IPublisherDocumentExportPdfOptions,
    type IWorkspacePublisherService,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    BuiltInPublisherPageLayouts,
    type IPublisherDocument,
    type IPublisherDocumentDefinition,
    type IPublisherDocumentTemplate,
    type IPublisherDocumentTemplateDefinition,
    type IPublisherPageLayout,
    type IPublisherPageLayoutDefinition,
    type ObjRef,
    areObjRefsEqual,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    convertPublisherDocument,
    convertPublisherDocumentTemplate,
    convertPublisherPageLayout,
} from "../../convertors/fromBackend/PublisherConverter.js";
import {
    convertPublisherDocumentTemplateToBackend,
    convertPublisherDocumentToBackend,
    convertPublisherPageLayoutToBackend,
} from "../../convertors/toBackend/PublisherConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { objRefToIdentifier } from "../../utils/api.js";
import { handleExportResultPolling } from "../../utils/exportPolling.js";

const auditInclude = ["createdBy" as const, "modifiedBy" as const];

// The backend orders a never-modified object by its creation time.
const byLastChange = ["modifiedAt,desc"];

function findBuiltInPageLayout(ref: ObjRef): IPublisherPageLayout | undefined {
    return BuiltInPublisherPageLayouts.find((layout) => areObjRefsEqual(layout.ref, ref));
}

export class TigerWorkspacePublisherService implements IWorkspacePublisherService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    public getPageLayouts = async (): Promise<IPublisherPageLayout[]> => {
        const layouts = await this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesReportPageLayouts(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    metaInclude: ["origin"],
                    include: auditInclude,
                    page,
                    size,
                }).then((response) =>
                    response.data.data.map((layout) =>
                        convertPublisherPageLayout(layout, response.data.included),
                    ),
                ),
            ),
        );
        return [...BuiltInPublisherPageLayouts, ...layouts];
    };

    public getPageLayout = async (ref: ObjRef): Promise<IPublisherPageLayout> => {
        const builtIn = findBuiltInPageLayout(ref);
        if (builtIn) {
            return builtIn;
        }
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityReportPageLayouts(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                metaInclude: ["origin"],
                include: auditInclude,
            });
            return convertPublisherPageLayout(response.data.data, response.data.included);
        });
    };

    public createPageLayout = async (
        layout: IPublisherPageLayoutDefinition,
    ): Promise<IPublisherPageLayout> => {
        const id = this.newObjectId(layout.ref, "Page layout");
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityReportPageLayouts(client.axios, client.basePath, {
                workspaceId: this.workspace,
                include: auditInclude,
                jsonApiReportPageLayoutPostOptionalIdDocument: {
                    data: {
                        type: "reportPageLayout",
                        id,
                        attributes: convertPublisherPageLayoutToBackend(layout),
                    },
                },
            });
            return convertPublisherPageLayout(response.data.data, response.data.included);
        });
    };

    public updatePageLayout = async (layout: IPublisherPageLayout): Promise<IPublisherPageLayout> => {
        const objectId = this.editableObjectId(layout.ref, "Page layout");
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityReportPageLayouts(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                include: auditInclude,
                jsonApiReportPageLayoutInDocument: {
                    data: {
                        type: "reportPageLayout",
                        id: objectId,
                        attributes: convertPublisherPageLayoutToBackend(layout),
                    },
                },
            });
            return convertPublisherPageLayout(response.data.data, response.data.included);
        });
    };

    public deletePageLayout = async (ref: ObjRef): Promise<void> => {
        const objectId = this.editableObjectId(ref, "Page layout");
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityReportPageLayouts(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            }),
        );
    };

    public getDocumentTemplates = async (): Promise<IPublisherDocumentTemplate[]> => {
        return this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesReportTemplates(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    metaInclude: ["origin"],
                    include: auditInclude,
                    sort: byLastChange,
                    page,
                    size,
                }).then((response) =>
                    response.data.data.map((template) =>
                        convertPublisherDocumentTemplate(template, response.data.included),
                    ),
                ),
            ),
        );
    };

    public getDocumentTemplate = async (ref: ObjRef): Promise<IPublisherDocumentTemplate> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityReportTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                metaInclude: ["origin"],
                include: auditInclude,
            });
            return convertPublisherDocumentTemplate(response.data.data, response.data.included);
        });
    };

    public createDocumentTemplate = async (
        template: IPublisherDocumentTemplateDefinition,
    ): Promise<IPublisherDocumentTemplate> => {
        const id = template.ref ? objRefToIdentifier(template.ref, this.authCall) : uuidv4();
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityReportTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                include: auditInclude,
                jsonApiReportTemplatePostOptionalIdDocument: {
                    data: {
                        type: "reportTemplate",
                        id,
                        attributes: convertPublisherDocumentTemplateToBackend(template),
                    },
                },
            });
            return convertPublisherDocumentTemplate(response.data.data, response.data.included);
        });
    };

    public updateDocumentTemplate = async (
        template: IPublisherDocumentTemplate,
    ): Promise<IPublisherDocumentTemplate> => {
        const objectId = objRefToIdentifier(template.ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityReportTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                include: auditInclude,
                jsonApiReportTemplateInDocument: {
                    data: {
                        type: "reportTemplate",
                        id: objectId,
                        attributes: convertPublisherDocumentTemplateToBackend(template),
                    },
                },
            });
            return convertPublisherDocumentTemplate(response.data.data, response.data.included);
        });
    };

    public deleteDocumentTemplate = async (ref: ObjRef): Promise<void> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityReportTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            }),
        );
    };

    public getDocuments = async (): Promise<IPublisherDocument[]> => {
        return this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesReports(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    metaInclude: ["origin"],
                    include: auditInclude,
                    sort: byLastChange,
                    page,
                    size,
                }).then((response) =>
                    response.data.data.map((publisherDocument) =>
                        convertPublisherDocument(publisherDocument, response.data.included),
                    ),
                ),
            ),
        );
    };

    public getDocument = async (ref: ObjRef): Promise<IPublisherDocument> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityReports(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                metaInclude: ["origin"],
                include: auditInclude,
            });
            return convertPublisherDocument(response.data.data, response.data.included);
        });
    };

    public createDocument = async (
        publisherDocument: IPublisherDocumentDefinition,
    ): Promise<IPublisherDocument> => {
        const id = publisherDocument.ref
            ? objRefToIdentifier(publisherDocument.ref, this.authCall)
            : uuidv4();
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityReports(client.axios, client.basePath, {
                workspaceId: this.workspace,
                include: auditInclude,
                jsonApiReportPostOptionalIdDocument: {
                    data: {
                        type: "report",
                        id,
                        attributes: convertPublisherDocumentToBackend(publisherDocument),
                    },
                },
            });
            return convertPublisherDocument(response.data.data, response.data.included);
        });
    };

    public updateDocument = async (publisherDocument: IPublisherDocument): Promise<IPublisherDocument> => {
        const objectId = objRefToIdentifier(publisherDocument.ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityReports(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                include: auditInclude,
                jsonApiReportInDocument: {
                    data: {
                        type: "report",
                        id: objectId,
                        attributes: convertPublisherDocumentToBackend(publisherDocument),
                    },
                },
            });
            return convertPublisherDocument(response.data.data, response.data.included);
        });
    };

    public deleteDocument = async (ref: ObjRef): Promise<void> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityReports(client.axios, client.basePath, {
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
            const documentExport = await ExportApi_CreateReportExport(client.axios, client.basePath, {
                workspaceId: this.workspace,
                exportReportExportRequest: {
                    format: "PDF",
                    reportId: documentId,
                    fileName: options?.filename ?? "",
                },
            });

            return handleExportResultPolling(
                client,
                {
                    workspaceId: this.workspace,
                    exportId: documentExport.data.exportResult,
                },
                "getReportExport",
                options?.timeout,
            );
        });
    };

    private newObjectId(ref: ObjRef | undefined, what: string): string {
        if (!ref) {
            return uuidv4();
        }
        this.assertNotBuiltIn(ref, what);
        return objRefToIdentifier(ref, this.authCall);
    }

    private editableObjectId(ref: ObjRef, what: string): string {
        this.assertNotBuiltIn(ref, what);
        return objRefToIdentifier(ref, this.authCall);
    }

    private assertNotBuiltIn(ref: ObjRef, what: string): void {
        if (findBuiltInPageLayout(ref)) {
            throw new UnexpectedError(`${what} "${objRefToString(ref)}" is built-in and cannot be changed.`);
        }
    }
}
