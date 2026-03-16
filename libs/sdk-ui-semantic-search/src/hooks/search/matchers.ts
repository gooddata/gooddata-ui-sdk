// (C) 2024-2026 GoodData Corporation

import type { HybridSearchMatcher, SearchItem, SearchItemGroup } from "./types.js";

/**
 * @alpha
 * Default matcher for the search. Supports title, name, description, summary.
 */
export function defaultMatcher<I extends SearchItem, G extends SearchItemGroup<I>>(
    item: I | G | string,
    searchQueryUpper: string,
): boolean {
    if (typeof item === "string") {
        return isUpperCaseMatch(item, searchQueryUpper);
    }

    const searchIn = [item.title, item.name, item.description, item.summary].filter(Boolean) as string[];

    return searchIn.some((name) => isUpperCaseMatch(name, searchQueryUpper));
}

/**
 * @alpha
 * Custom matcher for the search. Can be used to match any property of the search item.
 */
export function customMatcher<I extends SearchItem, G extends SearchItemGroup<I>>(
    props: (keyof I & keyof G)[],
): HybridSearchMatcher {
    return <I extends SearchItem, G extends SearchItemGroup<I>>(
        item: I | G | string,
        searchQueryUpper: string,
    ): boolean => {
        if (typeof item === "string") {
            return isUpperCaseMatch(item, searchQueryUpper);
        }

        const values = props.map((prop) => (item as Record<string, unknown>)[prop as string]) as string[];
        const searchIn = values.filter(Boolean);

        return searchIn.some((name) => isUpperCaseMatch(name, searchQueryUpper));
    };
}

function isUpperCaseMatch(keyword: string, searchQueryUpper: string) {
    return keyword.toUpperCase().includes(searchQueryUpper);
}
