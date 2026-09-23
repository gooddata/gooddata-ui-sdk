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
    enableSemanticSearch = false,
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
    // The loaded entries are the server's own matches, so only the semantic hits are taken from
    // here. Re-matching the entries on the client would drop the ones the server matched on a
    // field this matcher does not read, leaving rows missing from a list whose count still counts
    // them.
    const { searchRelatedItems } = useMemo(
        () => hybridSearch({ items: searchEntries }),
        [hybridSearch, searchEntries],
    );

    const loadedIdentifiers = useMemo(
        () => new Set(searchEntries.map((entry) => entry.identifier)),
        [searchEntries],
    );
    // Semantic hits carry identifier refs while loaded insights carry URI refs, so the generic
    // ObjRef comparison upstream never sees them as the same object. Compare identifiers instead.
    const relatedItems = useMemo(
        () => searchRelatedItems.filter((item) => !loadedIdentifiers.has(item.identifier)),
        [searchRelatedItems, loadedIdentifiers],
    );

    return {
        searchState,
        semanticSearchState,
        searchEntries,
        relatedItems,
        isSearching,
        handleSearchChange,
    };
}
