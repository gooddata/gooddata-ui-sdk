// (C) 2024-2025 GoodData Corporation

import { JsonApiMemoryItemOutWithLinks, JsonApiUserIdentifierOutWithLinks } from "@gooddata/api-client-tiger";
import { IMemoryItemMetadataObject } from "@gooddata/sdk-model";

import { IIncludedWithUserIdentifier, convertUserIdentifier } from "./UsersConverter.js";

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
        isDisabled: memoryItem.attributes?.isDisabled,
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
