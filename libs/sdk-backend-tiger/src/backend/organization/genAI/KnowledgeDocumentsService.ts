// (C) 2026 GoodData Corporation

import {
    GenAiApi_CreateOrgKnowledgeDocument,
    GenAiApi_DeleteOrgKnowledgeDocument,
    GenAiApi_GetOrgKnowledgeDocument,
    GenAiApi_ListOrgKnowledgeDocuments,
    GenAiApi_PatchOrgKnowledgeDocument,
    GenAiApi_SearchOrgKnowledge,
    GenAiApi_UpsertOrgKnowledgeDocument,
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
 * Organization-level knowledge documents service.
 *
 * All operations use the ai-json-api (gen-ai) endpoints scoped to the calling user's organization.
 *
 * @internal
 */
export class OrganizationKnowledgeDocumentsService implements IKnowledgeDocumentsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    async list(options?: IListKnowledgeDocumentsOptions): Promise<IKnowledgeDocumentsPage> {
        const response = await this.authCall((client) =>
            GenAiApi_ListOrgKnowledgeDocuments(client.axios, client.basePath, {
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
            GenAiApi_GetOrgKnowledgeDocument(client.axios, client.basePath, {
                documentId,
            }),
        );
        return response.data;
    }

    async create(request: ICreateKnowledgeDocumentRequest): Promise<void> {
        await this.authCall((client) =>
            GenAiApi_CreateOrgKnowledgeDocument(client.axios, client.basePath, {
                file: request.file,
            }),
        );
    }

    async upsert(request: IUpsertKnowledgeDocumentRequest): Promise<void> {
        await this.authCall((client) =>
            GenAiApi_UpsertOrgKnowledgeDocument(client.axios, client.basePath, {
                file: request.file,
            }),
        );
    }

    async delete(documentId: string): Promise<IDeleteKnowledgeDocumentResponse> {
        const response = await this.authCall((client) =>
            GenAiApi_DeleteOrgKnowledgeDocument(client.axios, client.basePath, {
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
            GenAiApi_PatchOrgKnowledgeDocument(client.axios, client.basePath, {
                documentId,
                aiPatchDocumentRequest: request,
            }),
        );
        return response.data;
    }

    async search(query: string, options?: ISearchKnowledgeOptions): Promise<ISearchKnowledgeResponse> {
        const response = await this.authCall((client) =>
            GenAiApi_SearchOrgKnowledge(client.axios, client.basePath, {
                query,
                limit: options?.limit,
                minScore: options?.minScore,
                scopes: options?.scopes,
            }),
        );
        return response.data;
    }
}
