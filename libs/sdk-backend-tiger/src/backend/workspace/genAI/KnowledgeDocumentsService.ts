// (C) 2026 GoodData Corporation

import type {
    ICreateKnowledgeDocumentRequest,
    ICreateKnowledgeDocumentResponse,
    IDeleteKnowledgeDocumentResponse,
    IKnowledgeDocumentMetadata,
    IKnowledgeDocumentsService,
    ISearchKnowledgeOptions,
    ISearchKnowledgeResponse,
    IUpsertKnowledgeDocumentRequest,
    IUpsertKnowledgeDocumentResponse,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

/**
 * Knowledge documents service.
 *
 * @remarks
 * Tiger-specific implementation using direct axios calls.
 * TODO: switch to a generated client call once the endpoint is described in OpenAPI.
 *
 * @internal
 */
export class KnowledgeDocumentsService implements IKnowledgeDocumentsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    private basePath(): string {
        return `/api/v1/actions/workspaces/${this.workspaceId}/ai/knowledge`;
    }

    async list(scopes?: string[]): Promise<IKnowledgeDocumentMetadata[]> {
        const response = await this.authCall((client) =>
            client.axios.get<{ documents: IKnowledgeDocumentMetadata[] }>(`${this.basePath()}/documents`, {
                params: scopes ? { scopes } : undefined,
            }),
        );
        return response.data.documents;
    }

    async get(filename: string): Promise<IKnowledgeDocumentMetadata> {
        const response = await this.authCall((client) =>
            client.axios.get<IKnowledgeDocumentMetadata>(
                `${this.basePath()}/documents/${encodeURIComponent(filename)}`,
            ),
        );
        return response.data;
    }

    async create(request: ICreateKnowledgeDocumentRequest): Promise<ICreateKnowledgeDocumentResponse> {
        const response = await this.authCall((client) =>
            client.axios.post<ICreateKnowledgeDocumentResponse>(`${this.basePath()}/documents`, request),
        );
        return response.data;
    }

    async upsert(request: IUpsertKnowledgeDocumentRequest): Promise<IUpsertKnowledgeDocumentResponse> {
        const response = await this.authCall((client) =>
            client.axios.put<IUpsertKnowledgeDocumentResponse>(`${this.basePath()}/documents`, request),
        );
        return response.data;
    }

    async delete(filename: string): Promise<IDeleteKnowledgeDocumentResponse> {
        const response = await this.authCall((client) =>
            client.axios.delete<IDeleteKnowledgeDocumentResponse>(
                `${this.basePath()}/documents/${encodeURIComponent(filename)}`,
            ),
        );
        return response.data;
    }

    async search(query: string, options?: ISearchKnowledgeOptions): Promise<ISearchKnowledgeResponse> {
        const response = await this.authCall((client) =>
            client.axios.get<ISearchKnowledgeResponse>(`${this.basePath()}/search`, {
                params: {
                    query,
                    ...(options?.limit !== undefined && { limit: options.limit }),
                    ...(options?.minScore !== undefined && { minScore: options.minScore }),
                    ...(options?.scopes && { scopes: options.scopes }),
                },
            }),
        );
        return response.data;
    }
}
