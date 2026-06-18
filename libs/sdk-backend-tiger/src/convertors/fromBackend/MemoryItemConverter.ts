// (C) 2024-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    type AfmMemoryItemCreatedByUsers,
    type AfmMemoryItemUser,
    type JsonApiAgentOutRelationshipsCreatedBy,
    type JsonApiExportDefinitionOutMeta,
    type JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";
import { type IMemoryCreatedByUsers } from "@gooddata/sdk-backend-spi";
import {
    type IMemoryItemMetadataObject,
    type IUser,
    type MemoryItemStrategy,
    idRef,
} from "@gooddata/sdk-model";

import { isInheritedObject } from "./ObjectInheritance.js";
import { type IIncludedWithUserIdentifier, convertUserIdentifier } from "./UsersConverter.js";

/**
 * Structural shape of the fields {@link convertMemoryItem} reads, satisfied by both the
 * workspace `JsonApiMemoryItemOutWithLinks` and the org `JsonApiOrgMemoryItemOutWithLinks`
 * generated types. Lets both scopes call the converter without nominal casts (the two
 * generated types differ in `tags`/`meta` presence and in their `title`/`description`
 * nullability and strategy/type enum nominal identity).
 * @internal
 */
export interface IConvertibleMemoryItem {
    id: string;
    type: string;
    meta?: JsonApiExportDefinitionOutMeta;
    relationships?: {
        createdBy?: JsonApiAgentOutRelationshipsCreatedBy;
    };
    attributes: {
        title?: string | null;
        description?: string | null;
        tags?: Array<string>;
        strategy: MemoryItemStrategy;
        instruction: string;
        isDisabled?: boolean;
        keywords?: Array<string>;
    };
}

/**
 * Converts memory item from API response to domain model
 * @internal
 */
export function convertMemoryItem(
    memoryItem: IConvertibleMemoryItem,
    included: JsonApiUserIdentifierOutWithLinks[],
): IMemoryItemMetadataObject {
    const { createdBy } = memoryItem.relationships ?? {};
    return {
        id: memoryItem.id,
        type: "memoryItem",
        isLocked: isInheritedObject(memoryItem),
        title: memoryItem.attributes?.title ?? "",
        description: memoryItem.attributes?.description ?? "",
        tags: memoryItem.attributes?.tags,
        strategy: memoryItem.attributes?.strategy,
        instruction: memoryItem.attributes?.instruction,
        isDisabled: Boolean(memoryItem.attributes?.isDisabled),
        keywords: memoryItem.attributes?.keywords ?? [],
        createdBy: convertUserIdentifier(createdBy, included as IIncludedWithUserIdentifier[]),
        ref: {
            identifier: memoryItem.id,
        },
        uri: memoryItem.id,
        production: true,
        deprecated: false,
        unlisted: false,
    };
}

export function convertMemoryItemCreatedByUsers(
    response: AfmMemoryItemCreatedByUsers,
): IMemoryCreatedByUsers {
    const { users = [], reasoning = "" } = response ?? {};

    return {
        users: users.map(convertMemoryItemCreatedByUser),
        reasoning,
    };
}

function convertMemoryItemCreatedByUser(user: AfmMemoryItemUser): IUser {
    invariant(user.userId, "Memory Item creator user is missing userId.");

    const firstName = user.firstname;
    const lastName = user.lastname;

    return {
        ref: idRef(user.userId, "user"),
        login: user.userId,
        firstName,
        lastName,
        fullName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
    };
}
