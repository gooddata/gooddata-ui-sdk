// (C) 2024-2025 GoodData Corporation

import { v4 as uuid } from "uuid";

import { IMemoryService } from "@gooddata/sdk-backend-spi";
import { IGenAIMemoryItem, IGenAIMemoryItemCreate } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

type MemoryItemServer = IGenAIMemoryItem;

export class MemoryService implements IMemoryService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    async list(options?: { signal?: AbortSignal }): Promise<IGenAIMemoryItem[]> {
        const response = await this.authCall((client) =>
            client.axios.get<MemoryItemServer[]>(
                `/api/v1/actions/workspaces/${encodeURIComponent(this.workspaceId)}/ai/memory`,
                { signal: options?.signal },
            ),
        );
        return response.data;
    }

    async create(item: IGenAIMemoryItemCreate): Promise<IGenAIMemoryItem> {
        // API expects full MemoryItem with id field according to OpenAPI spec
        const payload: IGenAIMemoryItem = {
            id: uuid(),
            ...item,
        };
        const response = await this.authCall((client) =>
            client.axios.post<MemoryItemServer>(
                `/api/v1/actions/workspaces/${encodeURIComponent(this.workspaceId)}/ai/memory`,
                payload,
            ),
        );
        return response.data;
    }

    async update(id: string, item: IGenAIMemoryItemCreate): Promise<IGenAIMemoryItem> {
        // API expects full MemoryItem with id field according to OpenAPI spec
        const payload: IGenAIMemoryItem = {
            id,
            ...item,
        };
        const response = await this.authCall((client) =>
            client.axios.put<MemoryItemServer>(
                `/api/v1/actions/workspaces/${encodeURIComponent(this.workspaceId)}/ai/memory/${encodeURIComponent(
                    id,
                )}`,
                payload,
            ),
        );
        return response.data;
    }

    async remove(id: string): Promise<void> {
        await this.authCall((client) =>
            client.axios.delete(
                `/api/v1/actions/workspaces/${encodeURIComponent(this.workspaceId)}/ai/memory/${encodeURIComponent(
                    id,
                )}`,
            ),
        );
    }
}
