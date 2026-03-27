// (C) 2026 GoodData Corporation

import {
    GenAiApi_CreateKnowledgeDocument,
    GenAiApi_DeleteKnowledgeDocument,
    GenAiApi_GetKnowledgeDocument,
    GenAiApi_ListKnowledgeDocuments,
    GenAiApi_PatchKnowledgeDocument,
    GenAiApi_SearchKnowledge,
    GenAiApi_UpsertKnowledgeDocument,
} from "@gooddata/api-client-tiger/endpoints/genAI";
import type {
    ICreateKnowledgeDocumentRequest,
    IDeleteKnowledgeDocumentResponse,
    IKnowledgeDocumentMetadata,
    IKnowledgeDocumentsPage,
    IKnowledgeDocumentsService,
    IListKnowledgeDocumentsOptions,
    IPatchKnowledgeDocumentRequest,
    ISearchKnowledgeOptions,
    ISearchKnowledgeResponse,
    IUpsertKnowledgeDocumentRequest,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

/**
 * Knowledge documents service.
 *
 * All operations use the ai-json-api (gen-ai) endpoints.
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
            GenAiApi_ListKnowledgeDocuments(client.axios, client.basePath, {
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

    async get(documentId: string): Promise<IKnowledgeDocumentMetadata> {
        const response = await this.authCall((client) =>
            GenAiApi_GetKnowledgeDocument(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                documentId,
            }),
        );
        return response.data;
    }

    async create(request: ICreateKnowledgeDocumentRequest): Promise<void> {
        await this.authCall((client) =>
            GenAiApi_CreateKnowledgeDocument(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                file: request.file,
            }),
        );
    }

    async upsert(request: IUpsertKnowledgeDocumentRequest): Promise<void> {
        await this.authCall((client) =>
            GenAiApi_UpsertKnowledgeDocument(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                file: request.file,
            }),
        );
    }

    async delete(documentId: string): Promise<IDeleteKnowledgeDocumentResponse> {
        const response = await this.authCall((client) =>
            GenAiApi_DeleteKnowledgeDocument(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                documentId,
            }),
        );
        return response.data;
    }

    async patch(
        documentId: string,
        request: IPatchKnowledgeDocumentRequest,
    ): Promise<IKnowledgeDocumentMetadata> {
        const response = await this.authCall((client) =>
            GenAiApi_PatchKnowledgeDocument(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                documentId,
                aiPatchDocumentRequest: request,
            }),
        );
        return response.data;
    }

    async search(query: string, options?: ISearchKnowledgeOptions): Promise<ISearchKnowledgeResponse> {
        const response = await this.authCall((client) =>
            GenAiApi_SearchKnowledge(client.axios, client.basePath, {
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
