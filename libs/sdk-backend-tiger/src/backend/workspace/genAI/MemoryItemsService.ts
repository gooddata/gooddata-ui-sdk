// (C) 2024-2025 GoodData Corporation

import { v4 as uuid } from "uuid";

import {
    JsonApiMemoryItemInTypeEnum,
    JsonApiMemoryItemPatchTypeEnum,
    JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";
import { IMemoryItemsQuery, IMemoryItemsService } from "@gooddata/sdk-backend-spi";
import { IMemoryItemDefinition, IMemoryItemMetadataObject } from "@gooddata/sdk-model";

import { MemoryItemsQuery } from "./MemoryItemsQuery.js";
import { convertMemoryItem } from "../../../convertors/fromBackend/MemoryItemConverter.js";
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
            const response = await client.entities.createEntityMemoryItems({
                workspaceId: this.workspaceId,
                include: ["createdBy"],
                jsonApiMemoryItemPostOptionalIdDocument: {
                    data: {
                        id: uuid(),
                        type: JsonApiMemoryItemInTypeEnum.MEMORY_ITEM,
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
            const response = await client.entities.updateEntityMemoryItems({
                workspaceId: this.workspaceId,
                objectId: id,
                jsonApiMemoryItemInDocument: {
                    data: {
                        id: id,
                        type: JsonApiMemoryItemInTypeEnum.MEMORY_ITEM,
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
            const response = await client.entities.patchEntityMemoryItems({
                workspaceId: this.workspaceId,
                objectId: id,
                jsonApiMemoryItemPatchDocument: {
                    data: {
                        id: id,
                        type: JsonApiMemoryItemPatchTypeEnum.MEMORY_ITEM,
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
            await client.entities.deleteEntityMemoryItems({
                workspaceId: this.workspaceId,
                objectId: id,
            });
        });
    }
}
