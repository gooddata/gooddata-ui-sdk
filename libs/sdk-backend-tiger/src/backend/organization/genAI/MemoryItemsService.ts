// (C) 2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import { type JsonApiUserIdentifierOutWithLinks } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityOrgMemoryItems,
    EntitiesApi_DeleteEntityOrgMemoryItems,
    EntitiesApi_GetAllEntitiesOrgMemoryItems,
    EntitiesApi_PatchEntityOrgMemoryItems,
    EntitiesApi_UpdateEntityOrgMemoryItems,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import {
    type IMemoryCreatedByUsers,
    type IMemoryItemsQuery,
    type IMemoryItemsService,
} from "@gooddata/sdk-backend-spi";
import { type IMemoryItemDefinition, type IMemoryItemMetadataObject, type IUser } from "@gooddata/sdk-model";

import { convertMemoryItem } from "../../../convertors/fromBackend/MemoryItemConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { OrganizationMemoryItemsQuery } from "./MemoryItemsQuery.js";

/**
 * Organization-level memory items service.
 *
 * Mirrors the workspace-level `MemoryItemsService`, but targets the org-scoped
 * JSON:API entities endpoint `/api/v1/entities/orgMemoryItems` (no workspaceId).
 *
 * @internal
 */
export class OrganizationMemoryItemsService implements IMemoryItemsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    getMemoryItemsQuery(): IMemoryItemsQuery {
        return new OrganizationMemoryItemsQuery(this.authCall);
    }

    async create(item: IMemoryItemDefinition): Promise<IMemoryItemMetadataObject> {
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityOrgMemoryItems(client.axios, client.basePath, {
                include: ["createdBy"],
                jsonApiOrgMemoryItemInDocument: {
                    data: {
                        id: uuid(),
                        type: "orgMemoryItem",
                        // OrgMemoryItem has no `tags` field (unlike workspace MemoryItem), so it is omitted.
                        attributes: {
                            instruction: item.instruction,
                            strategy: item.strategy,
                            title: item.title,
                            description: item.description,
                            isDisabled: item.isDisabled,
                            keywords: item.keywords,
                        },
                    },
                },
            });
            return convertMemoryItem(
                response.data.data,
                (response.data.included ?? []) as JsonApiUserIdentifierOutWithLinks[],
            );
        });
    }

    async update(id: string, item: IMemoryItemDefinition): Promise<IMemoryItemMetadataObject> {
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityOrgMemoryItems(client.axios, client.basePath, {
                id,
                include: ["createdBy"],
                jsonApiOrgMemoryItemInDocument: {
                    data: {
                        id,
                        type: "orgMemoryItem",
                        // Build attributes explicitly: OrgMemoryItem has no `tags`, and a PUT must
                        // not drop `keywords`.
                        attributes: {
                            instruction: item.instruction,
                            strategy: item.strategy,
                            title: item.title,
                            description: item.description,
                            isDisabled: item.isDisabled,
                            keywords: item.keywords,
                        },
                    },
                },
            });
            return convertMemoryItem(
                response.data.data,
                (response.data.included ?? []) as JsonApiUserIdentifierOutWithLinks[],
            );
        });
    }

    async patch(id: string, item: Partial<IMemoryItemDefinition>): Promise<IMemoryItemMetadataObject> {
        // OrgMemoryItem has no `tags` field, so strip it from the partial before sending.
        const { tags: _tags, ...attributes } = item;
        return this.authCall(async (client) => {
            const response = await EntitiesApi_PatchEntityOrgMemoryItems(client.axios, client.basePath, {
                id,
                include: ["createdBy"],
                jsonApiOrgMemoryItemPatchDocument: {
                    data: {
                        id,
                        type: "orgMemoryItem",
                        attributes,
                    },
                },
            });
            return convertMemoryItem(
                response.data.data,
                (response.data.included ?? []) as JsonApiUserIdentifierOutWithLinks[],
            );
        });
    }

    async delete(id: string): Promise<void> {
        return this.authCall(async (client) => {
            await EntitiesApi_DeleteEntityOrgMemoryItems(client.axios, client.basePath, {
                id,
            });
        });
    }

    async getCreatedByUsers(): Promise<IMemoryCreatedByUsers> {
        // Org memory has no dedicated "created-by users" action endpoint (unlike workspace).
        // Derive the full creator set from ALL org memory items (unfiltered) by paging through
        // every page so the filter options stay complete even when the org has many items.
        return this.authCall(async (client) => {
            const size = 500;
            const usersByLogin = new Map<string, IUser>();
            for (let page = 0; ; page++) {
                const response = await EntitiesApi_GetAllEntitiesOrgMemoryItems(
                    client.axios,
                    client.basePath,
                    { size, page, include: ["createdBy"] },
                );
                const included = (response.data.included ?? []) as JsonApiUserIdentifierOutWithLinks[];
                const items = response.data.data ?? [];
                for (const item of items) {
                    const { createdBy } = convertMemoryItem(item, included);
                    if (createdBy && !usersByLogin.has(createdBy.login)) {
                        // convertUserIdentifier only sets first/last name; compose fullName so the
                        // filter shows real names instead of the raw login (matching workspace scope).
                        const fullName =
                            createdBy.firstName && createdBy.lastName
                                ? `${createdBy.firstName} ${createdBy.lastName}`
                                : createdBy.fullName;
                        usersByLogin.set(createdBy.login, { ...createdBy, fullName });
                    }
                }
                if (items.length < size) {
                    break;
                }
            }
            return { users: [...usersByLogin.values()], reasoning: "" };
        });
    }
}
