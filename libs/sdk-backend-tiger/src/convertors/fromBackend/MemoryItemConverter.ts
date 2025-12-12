// (C) 2024-2025 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    type AfmMemoryItemCreatedByUsers,
    type AfmMemoryItemUser,
    type JsonApiMemoryItemOutWithLinks,
    type JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";
import { type IMemoryCreatedByUsers } from "@gooddata/sdk-backend-spi";
import { type IMemoryItemMetadataObject, type IUser, idRef } from "@gooddata/sdk-model";

import { type IIncludedWithUserIdentifier, convertUserIdentifier } from "./UsersConverter.js";

/**
 * Converts memory item from API response to domain model
 * @internal
 */
export function convertMemoryItem(
    memoryItem: JsonApiMemoryItemOutWithLinks,
    included: JsonApiUserIdentifierOutWithLinks[],
): IMemoryItemMetadataObject {
    const { createdBy } = memoryItem.relationships ?? {};
    return {
        id: memoryItem.id,
        type: "memoryItem",
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
