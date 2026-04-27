// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef } from "react";

import {
    type IInsight,
    type ISemanticSearchResultItem,
    insightCreated,
    insightId,
    insightIsLocked,
    insightSummary,
    insightTitle,
    insightUpdated,
    insightUri,
    insightVisualizationUrl,
    uriRef,
} from "@gooddata/sdk-model";
import {
    type HybridSearchItemBuilder,
    type SearchItemGroup,
    customMatcher,
    useHybridSearch,
} from "@gooddata/sdk-ui-semantic-search";

import { type IInsightPickerItem } from "./types.js";

const SEMANTIC_SEARCH_OBJECT_TYPES: ["visualization"] = ["visualization"];

const insightItemBuilder: HybridSearchItemBuilder<IInsightPickerItem> = (
    item: ISemanticSearchResultItem,
    { ref },
) => ({
    ref,
    title: item.title,
    description: item.description,
    identifier: item.id,
    isLocked: false,
    created: item.createdAt,
    updated: item.modifiedAt ?? item.createdAt,
    visualizationUrl: item.visualizationUrl ?? "",
});

interface IInsightGroup extends SearchItemGroup<IInsightPickerItem> {
    identifier?: string;
}

interface IUseInsightPickerHybridSearchOptions {
    insights: IInsight[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    enableSemanticSearch?: boolean;
    includeTags?: string[];
    excludeTags?: string[];
}

/**
 * Wraps useHybridSearch with the insight-specific item mapping and search state sync.
 *
 * @internal
 */
export function useInsightPickerHybridSearch({
    insights,
    searchQuery,
    onSearchChange,
    enableSemanticSearch = true,
    includeTags,
    excludeTags,
}: IUseInsightPickerHybridSearchOptions) {
    const searchEntries = useMemo<IInsightPickerItem[]>(
        () =>
            insights.map((insight) => ({
                ref: uriRef(insightUri(insight)),
                title: insightTitle(insight),
                description: insightSummary(insight),
                identifier: insightId(insight),
                uri: insightUri(insight),
                isLocked: insightIsLocked(insight),
                created: insightCreated(insight),
                updated: insightUpdated(insight),
                visualizationUrl: insightVisualizationUrl(insight),
            })),
        [insights],
    );

    const matcher = useMemo(
        () => customMatcher<IInsightPickerItem, IInsightGroup>(["title", "description", "identifier"]),
        [],
    );

    const {
        searchState,
        semanticSearchState,
        search: hybridSearch,
        onSearchQueryChange: setHybridSearchQuery,
    } = useHybridSearch<IInsightPickerItem, never>({
        objectTypes: SEMANTIC_SEARCH_OBJECT_TYPES,
        allowSematicSearch: enableSemanticSearch,
        itemBuilder: insightItemBuilder,
        includeTags,
        excludeTags,
        matcher,
    });

    // Sync controlled search query into hybrid search on mount
    const initializedSearch = useRef(false);
    useEffect(() => {
        if (!initializedSearch.current) {
            initializedSearch.current = true;
            setHybridSearchQuery(searchQuery);
        }
    }, [searchQuery, setHybridSearchQuery]);

    const handleSearchChange = useCallback(
        (query: string) => {
            setHybridSearchQuery(query);
            onSearchChange(query);
        },
        [setHybridSearchQuery, onSearchChange],
    );

    const isSearching = searchState.query !== "";
    const { searchItems, searchRelatedItems } = useMemo(
        () => hybridSearch({ items: searchEntries }),
        [hybridSearch, searchEntries],
    );
    const displayItems = useMemo(
        () => (isSearching ? [...searchItems, ...searchRelatedItems] : searchEntries),
        [isSearching, searchEntries, searchItems, searchRelatedItems],
    );

    return {
        searchState,
        semanticSearchState,
        searchEntries,
        displayItems,
        isSearching,
        handleSearchChange,
    };
}
