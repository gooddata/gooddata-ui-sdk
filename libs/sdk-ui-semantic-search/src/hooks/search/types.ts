// (C) 2024-2026 GoodData Corporation

import { type ISemanticSearchResultItem, type ObjRef, type ObjectType } from "@gooddata/sdk-model";

/**
 * @alpha
 * Defines the shape of the search item.
 */
export type SearchItem = {
    ref: ObjRef;
    title?: string;
    name?: string;
    description?: string;
    summary?: string;
};

/**
 * @alpha
 * Defines the shape of the search item group.
 */
export type SearchItemGroup<I> = {
    title?: string;
    name?: string;
    description?: string;
    summary?: string;
    items?: I[];
};

/**
 * @alpha
 * Defines the shape of the search results.
 */
export type SearchResults<I extends SearchItem, G extends SearchItemGroup<I>> = {
    searchItems: ReadonlyArray<I>;
    searchAllItems: ReadonlyArray<I>;
    searchItemGroups: ReadonlyArray<G>;
    searchKeywords: ReadonlyArray<string>;
};

/**
 * @alpha
 * Defines the shape of the search matcher.
 */
export type HybridSearchMatcher = <I extends SearchItem, G extends SearchItemGroup<I>>(
    item: I | G | string,
    searchQueryUpper: string,
) => boolean;

/**
 * @alpha
 * Defines the shape of the item builder.
 */
export type HybridSearchItemBuilder<I extends SearchItem> = (
    item: ISemanticSearchResultItem,
    props: {
        ref: ObjRef;
        type: ObjectType;
    },
) => I | null | undefined;
