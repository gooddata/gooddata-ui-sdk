// (C) 2024-2026 GoodData Corporation

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { doFilterRelatedItems } from "./search/related.js";
import { doSearch } from "./search/search.js";
import {
    type HybridSearchItemBuilder,
    type HybridSearchMatcher,
    type SearchItem,
    type SearchItemGroup,
    type SearchResults,
} from "./search/types.js";
import { type SemanticSearchHookInput, useSemanticSearch } from "./useSemanticSearch.js";

const SEARCH_DEBOUNCE_MS = 150;

/**
 * @alpha
 * On search query change callback.
 */
export type OnSearchQueryChanged = (searchQuery: string) => void;

/**
 * @alpha
 * Options for the useHybridSearch hook.
 */
export interface IUseHybridSearchOptions<I extends SearchItem> extends Pick<
    SemanticSearchHookInput,
    "deepSearch" | "limit" | "includeTags" | "excludeTags" | "objectTypes"
> {
    /**
     * The backend to use for the search.
     * If omitted, will be retrieved from the context.
     */
    backend?: IAnalyticalBackend;
    /**
     * The workspace to use for the search.
     * If omitted, will be retrieved from the context.
     */
    workspace?: string;

    /**
     * Allow semantic search.
     * default: true
     */
    allowSematicSearch?: boolean;
    /**
     * Debounce time in milliseconds for search query.
     * default: 150
     */
    debounceMs?: number;

    /**
     * Custom matcher for the search results.
     * If provided, the matcher will be used to filter the search results.
     * The matcher should return true if the item should be included in the search results,
     * and false otherwise.
     */
    matcher?: HybridSearchMatcher;

    /**
     * Item builder for the search results.
     * If provided, the item builder will be used to transform the search results into a different format.
     * The item builder should return the transformed item.
     */
    itemBuilder: HybridSearchItemBuilder<I>;
}

/**
 * @alpha
 * State of the search.
 */
export interface ISearchState {
    /**
     * The current search query.
     * This is the query that is currently being typed by the user.
     * It may be different from the debouncedQuery if the user is still typing.
     */
    query: string;
    /**
     * The debounced search query.
     * This is the query that is currently being used for the search.
     * It may be different from the query if the user is still typing.
     */
    debouncedQuery: string;
    /**
     * The current state of the search.
     * - idle - means the user has not typed anything yet
     * - searching - means the user is currently typing
     * - completed - means the user has stopped typing and the search is complete
     */
    state: "idle" | "searching" | "completed";
}

/**
 * @alpha
 * State of semantic search.
 */
export interface ISemanticSearchState {
    /**
     * The current state of semantic search.
     * - idle - means the semantic search is not running
     * - loading - means the semantic search is running
     * - error - means the semantic search failed
     * - success - means the semantic search succeeded
     */
    state: "idle" | "loading" | "error" | "success";
    /**
     * The message to show to the user that came from the backend.
     */
    message: string;
    /**
     * The error message if the semantic search failed.
     */
    error?: string;
}

/**
 * @alpha
 * Result of the useHybridSearch hook.
 */
export interface IHybridSearchResult<I extends SearchItem, G extends SearchItemGroup<I>> {
    // related to normal search
    searchState: ISearchState;

    // semantic search related
    semanticSearchState: ISemanticSearchState;

    // search function
    search: (props: {
        items: ReadonlyArray<I>;
        allItems?: ReadonlyArray<I>;
        itemGroups?: ReadonlyArray<G>;
        keywords?: string[];
    }) => ICombinedSearchResults<I, G>;

    // callbacks
    onSearchQueryChange: OnSearchQueryChanged;
}

/**
 * @alpha
 * Search results that are combined from semantic search and normal search.
 */
export interface ICombinedSearchResults<
    I extends SearchItem,
    G extends SearchItemGroup<I>,
> extends SearchResults<I, G> {
    // semantic search related
    searchRelatedItems: ReadonlyArray<I>;
    //states
    searchState: ISearchState;
    semanticSearchState: ISemanticSearchState;
}

/**
 * @alpha
 * Use a hybrid search implementation that debounce the search query and provide semantic search
 * related results
 */
export function useHybridSearch<I extends SearchItem, G extends SearchItemGroup<I>>({
    limit,
    workspace,
    backend,
    debounceMs = SEARCH_DEBOUNCE_MS,
    allowSematicSearch = true,
    deepSearch,
    objectTypes,
    includeTags,
    excludeTags,
    matcher,
    itemBuilder,
}: IUseHybridSearchOptions<I>): IHybridSearchResult<I, G> {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebouncedValue(searchQuery, debounceMs);
    const onSearchQueryChange = useOnSearchQueryChangeCallback(setSearchQuery);

    const semanticSearchProps = useMemo(() => {
        return {
            objectTypes,
            excludeTags,
            includeTags,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [objectTypes?.join(), includeTags?.join(), excludeTags?.join()]);

    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const { searchStatus, searchError, searchResults, searchMessage } = useSemanticSearch({
        searchTerm: allowSematicSearch ? debouncedSearchQuery : "",
        backend: effectiveBackend,
        workspace: effectiveWorkspace,
        deepSearch,
        limit,
        ...semanticSearchProps,
    });

    const searchState = useMemo(
        () => ({
            query: searchQuery,
            debouncedQuery: debouncedSearchQuery,
            state: getSearchState(searchQuery, debouncedSearchQuery),
        }),
        [debouncedSearchQuery, searchQuery],
    );

    const semanticSearchState = useMemo(
        () => ({
            state: searchStatus,
            error: searchError,
            message: searchMessage,
        }),
        [searchStatus, searchError, searchMessage],
    );

    const search = useCallback(
        (({ items, allItems = items, itemGroups = [], keywords = [] }) => {
            const results = doSearch(items, allItems, itemGroups, keywords, searchQuery, matcher);
            const searchRelatedItems = doFilterRelatedItems(
                results.searchAllItems,
                searchResults,
                itemBuilder,
            );

            return {
                ...results,
                searchRelatedItems,
                //states
                searchState,
                semanticSearchState,
            };
        }) as IHybridSearchResult<I, G>["search"],
        [searchQuery, searchState, semanticSearchState, searchResults, matcher, itemBuilder],
    );

    return {
        searchState,
        semanticSearchState,
        search,
        onSearchQueryChange,
    };
}

/**
 * Debounce a string value by the given delay.
 * Empty values are applied immediately (clearing search should feel instant).
 */
function useDebouncedValue(value: string, delay: number): string {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        // Clear search immediately — no debounce, no transition
        if (value === "") {
            setDebouncedValue("");
            return undefined;
        }

        timerRef.current = setTimeout(() => {
            // Mark as low-priority so React can interrupt for input events
            startTransition(() => setDebouncedValue(value));
        }, delay);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Create a callback that updates the search query.
 */
function useOnSearchQueryChangeCallback(setSearchQuery: OnSearchQueryChanged) {
    return useCallback(
        (query: string) => {
            setSearchQuery(query);
        },
        [setSearchQuery],
    );
}

//utils

function getSearchState<I extends SearchItem, G extends SearchItemGroup<I>>(
    searchQuery: string,
    debouncedSearchQuery: string,
): IHybridSearchResult<I, G>["searchState"]["state"] {
    if (searchQuery === "") {
        return "idle";
    }
    if (debouncedSearchQuery !== searchQuery) {
        return "searching";
    }
    return "completed";
}
