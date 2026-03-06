// (C) 2026 GoodData Corporation

import {
    ActionsApi_CreateDocument,
    ActionsApi_DeleteDocument,
    ActionsApi_GetDocument,
    ActionsApi_ListDocuments,
    ActionsApi_PatchDocument,
    ActionsApi_SearchKnowledge,
    ActionsApi_UpsertDocument,
} from "@gooddata/api-client-tiger/endpoints/actions";
import type {
    ICreateKnowledgeDocumentRequest,
    ICreateKnowledgeDocumentResponse,
    IDeleteKnowledgeDocumentResponse,
    IKnowledgeDocumentMetadata,
    IKnowledgeDocumentsPage,
    IKnowledgeDocumentsService,
    IListKnowledgeDocumentsOptions,
    IPatchKnowledgeDocumentRequest,
    ISearchKnowledgeOptions,
    ISearchKnowledgeResponse,
    IUpsertKnowledgeDocumentRequest,
    IUpsertKnowledgeDocumentResponse,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

/**
 * Knowledge documents service.
 *
 * @internal
 */
export class KnowledgeDocumentsService implements IKnowledgeDocumentsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    async list(options?: IListKnowledgeDocumentsOptions): Promise<IKnowledgeDocumentsPage> {
        const response = await this.authCall((client) =>
            ActionsApi_ListDocuments(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                ...(options?.scopes !== undefined && { scopes: options.scopes }),
                ...(options?.pageSize !== undefined && { size: options.pageSize }),
                ...(options?.pageToken !== undefined && { pageToken: options.pageToken }),
                ...(options?.query !== undefined && { query: options.query }),
                ...(options?.state !== undefined && { state: options.state }),
                // Request totalCount only on the first page to avoid overhead on subsequent loads
                ...(options?.pageToken === undefined && { metaInclude: "page" }),
            }),
        );
        return response.data;
    }

    async get(filename: string): Promise<IKnowledgeDocumentMetadata> {
        const response = await this.authCall((client) =>
            ActionsApi_GetDocument(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                filename,
            }),
        );
        return response.data;
    }

    async create(request: ICreateKnowledgeDocumentRequest): Promise<ICreateKnowledgeDocumentResponse> {
        const response = await this.authCall((client) =>
            ActionsApi_CreateDocument(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                createKnowledgeDocumentRequestDto: request,
            }),
        );
        return response.data;
    }

    async upsert(request: IUpsertKnowledgeDocumentRequest): Promise<IUpsertKnowledgeDocumentResponse> {
        const response = await this.authCall((client) =>
            ActionsApi_UpsertDocument(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                upsertKnowledgeDocumentRequestDto: request,
            }),
        );
        return response.data;
    }

    async delete(filename: string): Promise<IDeleteKnowledgeDocumentResponse> {
        const response = await this.authCall((client) =>
            ActionsApi_DeleteDocument(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                filename,
            }),
        );
        return response.data;
    }

    async patch(
        filename: string,
        request: IPatchKnowledgeDocumentRequest,
    ): Promise<IKnowledgeDocumentMetadata> {
        const response = await this.authCall((client) =>
            ActionsApi_PatchDocument(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                filename,
                patchKnowledgeDocumentRequestDto: request,
            }),
        );
        return response.data;
    }

    async search(query: string, options?: ISearchKnowledgeOptions): Promise<ISearchKnowledgeResponse> {
        const response = await this.authCall((client) =>
            ActionsApi_SearchKnowledge(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                query,
                limit: options?.limit,
                minScore: options?.minScore,
                scopes: options?.scopes,
            }),
        );
        return response.data;
    }
}
