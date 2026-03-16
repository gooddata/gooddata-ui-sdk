// (C) 2024-2026 GoodData Corporation

import { defaultMatcher } from "./matchers.js";
import {
    type HybridSearchMatcher,
    type SearchItem,
    type SearchItemGroup,
    type SearchResults,
} from "./types.js";

export function doSearch<I extends SearchItem, G extends SearchItemGroup<I>>(
    items: ReadonlyArray<I>,
    allItems: ReadonlyArray<I>,
    itemGroups: ReadonlyArray<G>,
    keywords: string[],
    searchQuery: string,
    matcher = defaultMatcher,
): SearchResults<I, G> {
    const searchItems = isMatchingItems(items, itemGroups, searchQuery, matcher);
    const searchAllItems = isMatchingItems(allItems, itemGroups, searchQuery, matcher);
    const searchItemGroups = isMatchingItemGroups(itemGroups, searchQuery, matcher);
    const searchKeywords = isMatchingKeywords(keywords, searchQuery, matcher);

    return {
        searchItems,
        searchAllItems,
        searchItemGroups,
        searchKeywords,
    };
}

function isMatchingItems<I extends SearchItem, G extends SearchItemGroup<I>>(
    items: ReadonlyArray<I>,
    itemGroups: ReadonlyArray<G>,
    searchQuery: string,
    matcher: HybridSearchMatcher,
) {
    const searchQueryUpper = upper(searchQuery);

    if (searchQuery === "") {
        if (itemGroups.length === 0) {
            return items;
        }
        return [];
    }
    return items.filter((item) => matcher(item, searchQueryUpper));
}

function isMatchingItemGroups<I extends SearchItem, G extends SearchItemGroup<I>>(
    itemGroups: ReadonlyArray<G>,
    searchQuery: string,
    matcher: HybridSearchMatcher,
) {
    const searchQueryUpper = upper(searchQuery);
    return itemGroups.filter((itemGroup) => matcher(itemGroup, searchQueryUpper));
}

function isMatchingKeywords(keywords: string[], searchQuery: string, matcher: HybridSearchMatcher) {
    const searchQueryUpper = upper(searchQuery);
    return keywords.filter((keyword) => matcher(keyword, searchQueryUpper));
}

function upper(searchQuery: string) {
    return searchQuery.toUpperCase();
}
