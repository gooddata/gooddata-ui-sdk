// (C) 2025 GoodData Corporation

import type { ISemanticSearchResultItem } from "@gooddata/sdk-model";

import type { ICatalogItem } from "./types.js";
import { OBJECT_TYPE_ORDER } from "../objectType/index.js";

/**
 * Sorts catalog feed items based on the search results.
 *
 * 1. Object type in ASC order
 * 2. Semantic search score in DESC order
 * 3. Original API order
 */
export function sortCatalogItems(
    feedItems: ICatalogItem[],
    searchItems: ISemanticSearchResultItem[],
): ICatalogItem[] {
    if (searchItems.length === 0 || feedItems.length === 0) {
        return feedItems;
    }

    const objectTypeOrderMap = new Map(OBJECT_TYPE_ORDER.map((type, index) => [type, index]));
    const scoreOrderMap = new Map(searchItems.map((item) => [item.id, item.score]));

    const orderedItems: ICatalogItem[] = [...feedItems];
    orderedItems.sort((a, b) => {
        // Object type in ASC order first
        const aObjectType = objectTypeOrderMap.get(a.type) ?? Infinity;
        const bObjectType = objectTypeOrderMap.get(b.type) ?? Infinity;
        if (aObjectType !== bObjectType) {
            return aObjectType - bObjectType;
        }

        // Semantic search score in DESC order second
        const aScore = scoreOrderMap.get(a.identifier) ?? -Infinity;
        const bScore = scoreOrderMap.get(b.identifier) ?? -Infinity;
        if (aScore !== bScore) {
            return bScore - aScore;
        }

        // Original API order last
        return 0;
    });
    return orderedItems;
}
