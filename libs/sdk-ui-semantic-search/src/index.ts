// (C) 2024-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

/**
 * This package provides React hooks and components for semantic search.
 * @packageDocumentation
 * @beta
 */

export {
    type SemanticSearchInputResult,
    type SemanticSearchHookInput,
    useSemanticSearch,
} from "./hooks/useSemanticSearch.js";
export { type FooterButtonAiAssistantProps, FooterButtonAiAssistant } from "./FooterButtonAiAssistant.js";
export { type SemanticSearchProps, SemanticSearch } from "./SemanticSearch.js";

export {
    type ICombinedSearchResults,
    type IHybridSearchResult,
    type ISearchState,
    type ISemanticSearchState,
    type IUseHybridSearchOptions,
    useHybridSearch,
    type OnSearchQueryChanged,
} from "./hooks/useHybridSearch.js";

export type {
    HybridSearchMatcher,
    SearchItem,
    SearchItemGroup,
    SearchResults,
    HybridSearchItemBuilder,
} from "./hooks/search/types.js";

export { defaultMatcher, customMatcher } from "./hooks/search/matchers.js";
