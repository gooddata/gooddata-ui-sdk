// (C) 2024-2025 GoodData Corporation

import { v4 as uuid } from "uuid";

import { JsonApiUserIdentifierOutWithLinks } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityMemoryItems,
    EntitiesApi_DeleteEntityMemoryItems,
    EntitiesApi_PatchEntityMemoryItems,
    EntitiesApi_UpdateEntityMemoryItems,
} from "@gooddata/api-client-tiger/entitiesObjects";
import { GenAiApi_MemoryCreatedByUsers } from "@gooddata/api-client-tiger/genAI";
import { IMemoryCreatedByUsers, IMemoryItemsQuery, IMemoryItemsService } from "@gooddata/sdk-backend-spi";
import { IMemoryItemDefinition, IMemoryItemMetadataObject } from "@gooddata/sdk-model";

import { MemoryItemsQuery } from "./MemoryItemsQuery.js";
import {
    convertMemoryItem,
    convertMemoryItemCreatedByUsers,
} from "../../../convertors/fromBackend/MemoryItemConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class MemoryItemsService implements IMemoryItemsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    getMemoryItemsQuery(): IMemoryItemsQuery {
        return new MemoryItemsQuery(this.authCall, {
            workspaceId: this.workspaceId,
        });
    }

    async create(item: IMemoryItemDefinition): Promise<IMemoryItemMetadataObject> {
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityMemoryItems(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                include: ["createdBy"],
                jsonApiMemoryItemPostOptionalIdDocument: {
                    data: {
                        id: uuid(),
                        type: "memoryItem",
                        attributes: {
                            instruction: item.instruction,
                            strategy: item.strategy,
                            title: item.title,
                            description: item.description,
                            tags: item.tags,
                            isDisabled: item.isDisabled,
                            keywords: item.keywords,
                        },
                    },
                },
            });
            return convertMemoryItem(
                response.data.data,
                response.data.included as JsonApiUserIdentifierOutWithLinks[],
            );
        });
    }

    async update(id: string, item: IMemoryItemDefinition): Promise<IMemoryItemMetadataObject> {
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityMemoryItems(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                objectId: id,
                jsonApiMemoryItemInDocument: {
                    data: {
                        id: id,
                        type: "memoryItem",
                        attributes: item,
                    },
                },
            });
            return convertMemoryItem(
                response.data.data,
                response.data.included as JsonApiUserIdentifierOutWithLinks[],
            );
        });
    }

    async patch(id: string, item: Partial<IMemoryItemDefinition>): Promise<IMemoryItemMetadataObject> {
        return this.authCall(async (client) => {
            const response = await EntitiesApi_PatchEntityMemoryItems(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                objectId: id,
                jsonApiMemoryItemPatchDocument: {
                    data: {
                        id: id,
                        type: "memoryItem",
                        attributes: item,
                    },
                },
            });
            return convertMemoryItem(
                response.data.data,
                response.data.included as JsonApiUserIdentifierOutWithLinks[],
            );
        });
    }

    async delete(id: string): Promise<void> {
        return this.authCall(async (client) => {
            await EntitiesApi_DeleteEntityMemoryItems(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                objectId: id,
            });
        });
    }

    async getCreatedByUsers(): Promise<IMemoryCreatedByUsers> {
        const response = await this.authCall((client) =>
            GenAiApi_MemoryCreatedByUsers(client.axios, client.basePath, { workspaceId: this.workspaceId }),
        );
        return convertMemoryItemCreatedByUsers(response.data);
    }
}
